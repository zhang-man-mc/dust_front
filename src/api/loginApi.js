import { $http } from './index';
export default {
    login(username,password){
        const param = {}
        param.uiAccountName = username
        param.uiPassword = password
        return $http.post('/dust/login',param)
    }
}