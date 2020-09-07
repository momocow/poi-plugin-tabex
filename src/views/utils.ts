import { AnyAction, Dispatch } from 'redux'
import { observe, observer } from 'redux-observers/types'
import { Observable } from 'rxjs'
import { Selector } from 'reselect'
import { Options as ReduxObserversOptions } from 'redux-observers'

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
