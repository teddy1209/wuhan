import {get} from './http';
export const getTX = key => get('http://api.tianapi.com/txapi/ncov/index', key);