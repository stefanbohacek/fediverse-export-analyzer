const loadEmbedScript = (instance) => {
    let scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', `${instance}/embed.js`);
    document.body.appendChild(scriptTag);
};

export default loadEmbedScript;