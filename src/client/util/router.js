export function getRouterBaseUrl () {
  // page in our application
  const pages = ['login', 'reset', 'site-select', 'patient', 'account', 'history', 'form'];
  // split window url into parts eg ["", "develop", "site-select"] or ["", "develop"]
  const parts = window.location.pathname.split('/');
  if (!parts.find(part => part !== '')) return '';
  // check if a page exists in the url, if so we will use that as the baseUrl.
  // /develop/login/login >> /develop and /develop/another/subfolder/login/form >> /develop/another/subfolder
  // pages in the app are not case sensitive, but the baseUrl might be
  // /develop/Another/subFolder/LOGIN >> /develop/Another/subFolder
  const index = parts.findIndex(part => pages.find(page => page === part.toLowerCase()));
  if (index > 0) {
    return parts.slice(0,index).join('/');
  }

  // by default, just use the whole path we will turn ["", "develop"] into /develop
  return parts.join('/');
}
