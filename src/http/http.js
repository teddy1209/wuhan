import axios from 'axios';
import qs from 'qs';

axios.interceptors.request.use(config => {
    return config;
}, error => {
    return Promise.reject(error)
})

axios.interceptors.response.use(response => {
    return response
}, error => {
    return Promise.resolve(error.response)
})

function checkStatus (response) {
    if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
        return response
    }
    return {
        status: -404,
        msg: '请求异常'
    }
}

function checkCode (res) {
    if (res.status === -404) {
        alert(res.msg)
    }
    return res
}

export function post (url, data) {
    return axios({
        method: 'post',
        baseURL: '',
        url,
        data: qs.stringify(data),
        timeout: 10000,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
        }).then(
            (response) => {
                return checkStatus(response)
            }
        ).then(
            (res) => {
                return checkCode(res)
            }
    )
}
    
export function get (url, params) {
    return axios({
        method: 'get',
        baseURL: '',
        url,
        params, // get 请求时带的参数
        timeout: 10000,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
        }).then(
            (response) => {
                return checkStatus(response)
            }
        ).then(
            (res) => {
                return checkCode(res)
            }
    )
}