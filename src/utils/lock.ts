export class LockError extends Error {
  name = 'LockError'
}

export type CriticalSection<T> = () => T | Promise<T>

export class Acquirer<Role> {
  public frozen: boolean = false
  private readonly _promises: Array<Promise<any>> = []

  constructor (
    public owner: Role
  ) { }

  async append<T> (cs: CriticalSection<T>): Promise<T> {
    if (this.frozen) {
      throw new Error('the acquirer can only schedule new job before joined')
    }
    const promise = Promise.resolve(cs())
    this._promises.push(promise)
    return await promise
  }

  async join (): Promise<void> {
    this.frozen = true
    await Promise.all(this._promises)
  }
}

/**
 * RLock is reentrant to the same "role".
 * Owner switching occurs when a role other than the owner acquires the lock.
 * While owner switching, the new acquirer will wait for all previous acquirers
 * to release.
 */
export class RLock<Role = any> {
  private readonly _acquirers: Array<Acquirer<Role>> = []

  public get busy (): boolean {
    return this._acquirers.length > 0
  }

  public async acquire<T> (role: Role, cs: CriticalSection<T>): Promise<T> {
    for (const acquirer of this._acquirers.slice()) {
      const acquirerFrozen = acquirer.frozen
      await acquirer.join()
      if (!acquirerFrozen) { // the first one to call acquirer.join()
        const acquirerIndex = this._acquirers.indexOf(acquirer)
        if (acquirerIndex >= 0) {
          this._acquirers.splice(acquirerIndex, 1)
        }
      }
    }

    const size = this._acquirers.length
    // init acquirer
    if (!this.busy || this._acquirers[size - 1].owner !== role) {
      this._acquirers.push(new Acquirer(role))
    }
    
    return await ownedAcquirer.append(cs)
  }
}
