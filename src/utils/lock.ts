export type CriticalSection<T> = () => T | Promise<T>

type Resolve<T> = (value: T) => void
type Reject<E extends Error> = (error: E) => void

interface Job<T, E extends Error> {
  cs: CriticalSection<T>
  resolve: Resolve<T>
  reject: Reject<E>
  active: boolean
  done: boolean
}

interface AcquirerBatch {
  acquirer: any
  queue: Array<Job<any, Error>>
}

function createJob <T, E extends Error> (
  cs: CriticalSection<any>, resolve: Resolve<T>, reject: Reject<E>
): Job<T, E> {
  return { cs, resolve, reject, done: false, active: false }
}

function createBatch (acquirer: any): AcquirerBatch {
  return { acquirer, queue: [] }
}

/**
 * A reentrant lock just like threading.RLock in Python but
 * with some modifications:
 *
 * - CS stands for Critical Section which is a function that access the critical
 *   resource.
 * - The concept of "thread" is substituted by "acquirer". The lock is owned by
 *   an acquirer at a time.
 * - Introduce the concept of "batch". A batch is a series of successive
 *   acquire() calls from the same acquirer. CS's in the same batch are run
 *   simutaneously.
 * - The active batch is the first batch in the acquirer queue and CS's in this
 *   batch are run right after the batch becomes active. If a new CS joins the
 *   active batch, it is also run immediately.
 * - The entrance batch is the last batch in the acquirer queue of the lock and
 *   is the only batch that can accept new CS's. The entrance batch will switch
 *   to the next one when one of the following conditions are met:
 *   - an acquirer other than the one of the entrance batch acquires the lock
 *   - any acquire call after the entrance batch is full
 */
export class RLock<Acquirer = any> {
  private readonly _acquirers: AcquirerBatch[] = []

  public get owner (): Acquirer | null {
    return this._activeBatch?.acquirer ?? null
  }

  private get _activeBatch (): AcquirerBatch | null {
    return this._acquirers[0] ?? null
  }

  private get _entranceBatch (): AcquirerBatch | null {
    return this._acquirers[this._acquirers.length - 1] ?? null
  }

  public async acquire<T = any> (
    acquirer: Acquirer,
    cs: CriticalSection<T>
  ): Promise<T> {
    return await new Promise<T>((resolve, reject) => {
      if (
        this._entranceBatch === null ||
        this._entranceBatch.acquirer !== acquirer
      ) {
        this._acquirers.push(createBatch(acquirer))
      }
      this._entranceBatch?.queue.push(createJob(cs, resolve, reject))
      if (this._entranceBatch === this._activeBatch) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._nextAcquirer()
      }
    })
  }

  private async _nextAcquirer (): Promise<void> {
    if (this._activeBatch === null) { return }
    const inactiveJobs = this._activeBatch.queue.filter(j => !j.active)
    await Promise.all(inactiveJobs.map(async j => await this._runCS(j)))
    if (this._activeBatch.queue.every(j => j.done)) {
      this._acquirers.shift()
      await this._nextAcquirer()
    }
  }

  private async _runCS (job: Job<any, Error>): Promise<void> {
    job.active = true
    try {
      job.resolve(await Promise.resolve(job.cs()))
    } catch (e) {
      job.reject(e)
    } finally {
      job.done = true
    }
  }
}
