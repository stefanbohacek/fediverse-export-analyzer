import getCookie from './getCookie.min.js';
import setCookie from './setCookie.min.js';

class Cookie {

}

Cookie.prototype.set = setCookie;
Cookie.prototype.get = getCookie;

export default Cookie;
