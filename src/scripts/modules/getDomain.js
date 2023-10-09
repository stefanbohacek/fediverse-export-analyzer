const getDomain = (url) => {
    let domain = (new URL(url));
    return domain.hostname;
};

export default getDomain;
