const getPollOptions = (pollOptionsElement) =>  {
    const pollOptionsElementValue = pollOptionsElement.value?.trim();
    let options = [];

    if (pollOptionsElementValue && pollOptionsElementValue.length){
        options = pollOptionsElementValue
        .split('\n')
        .slice(0, 100)
        .filter(option => option && option.length);    
    }

    return options;
};

export default getPollOptions;
