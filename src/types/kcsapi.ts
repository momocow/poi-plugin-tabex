// @see https://github.com/andanteyk/ElectronicObserver/blob/develop/ElectronicObserver/Other/Information/apilist.txt#L868

export enum ApiQuestState {
  /**
   * 未受領
   */
  Inactive = 1,

  /**
   * 遂行中
   */
  Active = 2,

  /**
   * 達成
   */
  Done = 3
}

export enum ApiQuestCategory {
  /**
   * 出撃
   */
  ShuTsuGeKi = 2,

  /**
   * 出撃(2)
   */
  ShuTsuGeKi2 = 8,

  /**
   * 出撃(3)
   */
  ShuTsuGeKi3 = 9
}

export interface ApiQuest {
  api_no: number
  api_category: ApiQuestCategory
  api_state: ApiQuestState
}

export interface ApiQuestList {
  api_list: ApiQuest[]
}
