import util from "util";

const debug = (title, observed) => {
  console.log(
    title,
    util.inspect(observed, { showHidden: false, depth: null, colors: true })
  );
};

export default debug;
