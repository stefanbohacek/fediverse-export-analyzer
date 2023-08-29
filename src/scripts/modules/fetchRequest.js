import sleep from '/js/modules/sleep.min.js';

const fetchRequest = async (url, platform, options) => {
  // console.log('debug:fetchRequest', url, platform, options);

  try {
    const response = await fetch(url, options);
    // console.log({
    //   url,
    //   response: {
    //     status: response.status,
    //     body: response.body,
    //   }
    // });
    let data = await response.json();
    let nextPage;

    switch (platform) {
      case "mastodon":
      case "hometown":
      case "friendica":
      case "pleroma":
      case "akkoma":
        if (/<([^>]+)>; rel="next"/g.test(response.headers.get("link"))) {
          nextPage = /<([^>]+)>; rel="next"/g.exec(
            response.headers.get("link")
          )[1];
        }

        if (nextPage) {
          await sleep(500);
          data = data.concat(
            await fetchRequest(nextPage, platform, options)
          );
        }

        break;
      case "misskey":
      case "calckey":
      case "firefish":
      case "foundkey":
      case "magnetar":
        if (data.length === window.globalConfig.misskeyFetchLimit) {
          if (data && data.length) {
            const lastAccount = data.slice(-1)[0];
            let body = JSON.parse(options.body);
            body.untilId = lastAccount.id;
            options.body = JSON.stringify(body);
          }
          await sleep(500);
          data = data.concat(
            await fetchRequest(url, platform, options)
          );
        }
        break;
      default:
        break;
    }

    return data;
  } catch (error) {
    console.log("fetchRequest error", { error });
    return [];
  }
};

export default fetchRequest;
