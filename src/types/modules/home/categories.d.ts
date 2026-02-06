// 获取活动分类列表
// export interface categories {
//   code: number;
//   data: Data;
//   message: string;
//   [property: string]: any;
// }

// export interface Data {
//   list: List[];
//   [property: string]: any;
// }

// export interface List {
//   icon: string;
//   id: number;
//   name: string;
//   [property: string]: any;
// }


export interface categories {
  list: List[];
  [property: string]: any;
}

export interface List {
  id: number;
  name: string;
  icon: string;
  sort: number;
  [property: string]: any;
}