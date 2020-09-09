import { Map } from 'immutable'
import { AnyAction, Dispatch } from 'redux'
import { Options as ReduxObserversOptions } from 'redux-observers'
import { observe, observer } from 'redux-observers/types'
import { Selector } from 'reselect'
import { forkJoin, from, Observable } from 'rxjs'
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators'
import { resourceLock, WikiResource, loadQuest } from '../kcwiki'
import { wikiQuestMapSelector } from '../selectors'
import { ApiQuestMap, WikiQuest, WikiQuestMap } from '../types'
import { store } from './redux'

/**
 * 2=出撃, 8=出撃(2), 9=出撃(3)
 */
export const SORTIE_CATEGORIES: readonly number[] = [2, 8, 9]

export interface ChangeHandle<T> {
  dispatch: Dispatch<AnyAction>
  current: T
  previous?: T
}

export function observeReduxStore$<S extends Selector<any, any>> (
  store: any, selector: S, options?: ReduxObserversOptions
): Observable<ChangeHandle<ReturnType<S>>> {
  return new Observable(
    (subscriber) => observe(store, [
      observer(
        state => selector(state),
        (dispatch, current, previous) => {
          subscriber.next({ dispatch, current, previous })
        },
        options
      )
    ])
  )
}

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
  (apiQuestMap: ApiQuestMap): Observable<WikiQuestMap> => {
    return forkJoin( // forkJoin will wait for completion before piping
      acquireWikiResource$(WikiResource.KcwikiQuestData).pipe(
        // critical section
        mergeMap(lock => from(apiQuestMap.entries()).pipe(
          filter(([_, q]) => SORTIE_CATEGORIES.includes(q.api_category)),
          filter(([_, q]) => q.api_state < 3), // 3=達成
          map(([n]) => n),
          filter(n => !wikiQuestMapSelector(store.getState()).has(n)),
          map(n => Number(n)),
          mergeMap(n => from(loadQuest(n))),
          filter((q): q is WikiQuest => q !== null),
          reduce<WikiQuest, WikiQuestMap>(
            (map, q) => map.set(q.game_id, q), Map()
          ),
          tap(() => lock.release())
        ))
      )
    ).pipe(
      map(([wikiQuestMap]) => wikiQuestMap)
    )
  }
