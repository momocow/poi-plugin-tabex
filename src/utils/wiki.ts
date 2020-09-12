import { Map } from 'immutable'
import { forkJoin, from, Observable } from 'rxjs'
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators'
import {
  loadQuest, resourceLock, WikiResource
} from '../kcwiki'
import { ApiQuestMap, WikiQuest, WikiQuestMap } from '../types'
import { wikiQuestMapSelector } from '../selectors'

/**
 * 2=出撃, 8=出撃(2), 9=出撃(3)
 */
export const SORTIE_CATEGORIES: readonly number[] = [2, 8, 9]

export interface LockHandle {
  release: () => void
}

export function acquireWikiResource$ (
  name: WikiResource
): Observable<LockHandle> {
  return new Observable(observer => {
    const lockPromise = new Promise<void>(
      resolve => observer.next({ release: resolve })
    )
    resourceLock.acquire(name, async () => await lockPromise)
      .then(() => observer.complete())
      .catch(error => observer.error(error))
  })
}

export const processWikiQuestMap$ =
  (state: any, apiQuestMap: ApiQuestMap): Observable<WikiQuestMap> => {
    return forkJoin([ // forkJoin will wait for completion before piping
      acquireWikiResource$(WikiResource.KcwikiQuestDataRead).pipe(
        // critical section
        mergeMap(lock => from(apiQuestMap.entries()).pipe(
          filter(([_, q]) => SORTIE_CATEGORIES.includes(q.api_category)),
          filter(([_, q]) => q.api_state < 3), // 3=達成
          map(([n]) => n),
          filter(n => !wikiQuestMapSelector(state).has(n)),
          map(n => Number(n)),
          mergeMap(n => from(loadQuest(n))),
          filter((q): q is WikiQuest => q !== null),
          reduce<WikiQuest, WikiQuestMap>(
            (map, q) => map.set(q.game_id, q), Map()
          ),
          tap(() => { lock.release() })
        ))
      )
    ]).pipe(
      map(([WikiQuestMap]) => WikiQuestMap)
    )
  }
