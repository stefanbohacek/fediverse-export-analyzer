const isBoost = (post) => {
  let isPostBoost = false;

  if (post.object && !post.object.id) {
    isPostBoost = true;
  }

  return isBoost;
};

export default isBoost;
