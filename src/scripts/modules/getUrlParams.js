const getUrlParams = (clear) => {
  const url = location.href;
  let params = {};
  
  if(url.indexOf('?') !== -1){
      const paramsArray = url.split('?')[1].split('&');
  
      for(let i=0; i<=paramsArray.length-1; i++){
          const paramsArraySplit = paramsArray[i].split('=');
          params[paramsArraySplit[0]] = paramsArraySplit[1];
      }
  }

  if (clear){
      window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  return params;
};

export default getUrlParams;
