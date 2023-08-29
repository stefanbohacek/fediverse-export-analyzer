const getRandomRange = (max, min, fixed) => (Math.random() * (max - min) + min).toFixed(fixed) * 1;

export default getRandomRange;
