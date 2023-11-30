import sortArrayOfObjects from "/js/modules/sortArrayOfObjects.min.js";
import getDomain from "/js/modules/getDomain.min.js";
import loadEmbedScript from "/js/modules/loadEmbedScript.min.js";
import Cookie from "/js/cookies/main.min.js";

const cookieManager = new Cookie();
const fileInput = document.getElementById("file-input");
const introElement = document.getElementById("intro");
const loadingAnimation = document.getElementById("loading-animation");
const loadingText = document.getElementById("loading-text");
const resultsElement = document.getElementById("results");
const userInfo = document.getElementById("user-info");
const userAvatar = document.getElementById("user-avatar");
const userDescription = document.getElementById("user-description");
const userDataBreakdown = document.getElementById("user-data-breakdown");
const chartElement = document.getElementById("chart");

const handleUpload = () => {
  if (fileInput) {
    fileInput.addEventListener("change", async (ev) => {
      loadingAnimation.classList.remove("d-none");
      loadingText.classList.remove("d-none");
      fileInput.disabled = true;
      const formData = new FormData();
      formData.set("archive", fileInput.files[0]);

      const resp = await fetch("/extract-data", {
        method: "POST",
        body: formData,
      });

      const response = await resp.json();

      if (response && response.data) {
        introElement.classList.add("d-none");
        resultsElement.classList.remove("d-none");
        const userData = response.data;

        // let userDomain = getDomain(userData.actor.id);
        let userDescriptionHTML = "";
        let userDataBreakdownHTML = "";

        if (userData.actor) {
          userDescriptionHTML += `
          <p class="mb-0">
            <strong>${
              userData.actor.name || userData.actor.preferredUsername
            }</strong>
          </p>
          ${userData.actor.summary.replaceAll('class="invisible"', "")}
          `;

          if (userData.actor.attachment) {
            userDescriptionHTML += `
            <ul class="list-group">
              ${userData.actor.attachment
                .map(
                  (attachment) => `
                <li class="list-group-item">${
                  attachment.name
                }: ${attachment.value.replace('class="invisible"', "")}</li>
              `
                )
                .join("")}
            </ul>
            `;
          }

          userDescription.innerHTML = `<div>${userDescriptionHTML}</div>`;

          if (userData.avatar_url) {
            userAvatar.innerHTML = `
              <img class="img-thumbnail" width="64" height="64" src="${userData.avatar_url}">
            `;
          } else if (userData.avatar) {
            userAvatar.innerHTML = `
              <img class="img-thumbnail" width="64" height="64" src="data:image/jpg;base64,${userData.avatar}">
            `;
          }
        } else {
          userInfo.remove();
          userDescription.remove();
        }

        let posts = [];
        let firstPost;
        let postCount = 0;

        if (userData?.outbox?.orderedItems) {
          posts = userData.outbox.orderedItems;
        } else if (userData?.outbox) {
          posts = userData.outbox;
        }

        postCount = posts.length;
        let milestones = [];

        let counter = {
          posts: 0,
          replies: 0,
          reblogs: 0,
          total: 0,
        };

        if (postCount) {
          // posts = sortArrayOfObjects(posts, key, desc)
          const maxRoot = Math.ceil(Math.pow(posts.length, 1 / 10));
          let index = 0;
          firstPost = posts[0];

          posts.forEach((post) => {
            let isSemiPublic = false;
            const recipients = [...post.to, ...post.cc];

            recipients.forEach((recipient) => {
              if (recipient.endsWith("/followers")) {
                isSemiPublic = true;
              }
            });

            if (isSemiPublic) {
              index++;
              if (posts.length >= 10 && index <= maxRoot) {
                const post = posts[Math.pow(10, index)];
                const url = post.id.replace("/activity", "");

                let milestone = {};
                let isBoost = false;

                if (!post.object.id) {
                  isBoost = true;
                }

                milestone = {
                  label: [`${Math.pow(10, index).toLocaleString()}th post`],
                  url,
                  isBoost,
                };

                milestones.push(milestone);
              }
              counter.total++;
              if (post.type === "Create") {
                if (post.object.inReplyTo) {
                  counter.replies++;
                } else {
                  counter.posts++;
                }
              } else {
                try {
                  if (
                    post.id &&
                    post.object &&
                    post.id.split("/users/")[0] ===
                      post.object.split("/users/")[0]
                  ) {
                    console.log(post);
                    counter.posts++;
                    counter.total++;
                  } else {
                    counter.reblogs++;
                  }
                } catch (err) {
                  /*noop*/
                }
              }
            } else {
              // console.log(post.id.replace("users/", "@").replace("statuses/", "").replace("/activity", ""), recipients);
              // console.log(recipients);
              // if (recipients.length === 0){
              //   console.log(post.id.replace("users/", "@").replace("statuses/", "").replace("/activity", ""));
              // }
            }
          });
          // console.log({ counter });
        }

        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };

        if (userData.actor) {
          const accountCreationDate = moment(userData.actor.published);
          const today = moment();
          const timeAgo = today.diff(accountCreationDate, "days");

          userDataBreakdownHTML += `
          <p>
            You created your account on <strong>${new Date(
              userData.actor.published
            ).toLocaleDateString(
              undefined,
              options
            )}</strong>, which is <strong>${timeAgo.toLocaleString()} day(s) ago</strong>. Since then, you posted <strong>${counter.total.toLocaleString()} times</strong>, or about ${Math.round(
            counter.total / timeAgo
          ).toLocaleString()} time(s) a day on average.
          </p>
          `;
        }

        if (counter.reblogs > 0 || counter.replies > 0) {
          userDataBreakdownHTML += `
          <p>
            You have reblogged <strong>${counter.reblogs.toLocaleString()} post(s)</strong>, replied <strong>${counter.replies.toLocaleString()} time(s)</strong>, and posted <strong>${counter.posts.toLocaleString()} new post(s)</strong>.
          </p>
          `;
        }

        let instanceURL;

        if (firstPost) {
          let postURL;
          let url;

          if (["firefish", "calckey", "misskey"].includes(userData.format)) {
            // Export file doesn't contain server name.
          } else {
            postURL = firstPost?.uri || firstPost?.object?.id || firstPost?.id;

            try {
              url = new URL(postURL);
            } catch (err) {
              console.log("error parsing data file", err);
            }

            if (url && url.protocol && url.hostname) {
              instanceURL = `${url.protocol}//${url.hostname}`;
            }

            userDataBreakdownHTML += `
              <p>
                Here's your <a href="${postURL}" target="_blank">first post</a>!
              </p>
            `;

            if (userData.format === "mastodon") {
              userDataBreakdownHTML += `
              <iframe
                src="${postURL}/embed"
                class="mastodon-embed"
                style="max-width: 100%; border: 0" width="400"
                allowfullscreen="allowfullscreen"></iframe>
            `;
            }

            if (milestones && milestones.length) {
              userDataBreakdownHTML += `
                <p class="mt-3">
                  Here are more of your milestones:
                </p>
                <ul>
                ${milestones
                  .map(
                    (milestone) => `
                  <li>
                    <a target="_blanlk" href="${milestone.url}">${
                      milestone.label
                    }</a>${milestone.isBoost ? ` (boost)` : ""}
                  </li>
                `
                  )
                  .join("")}
                </ul>
              `;
            }

            userDataBreakdownHTML += `
              <p class="mt-4">
                And this is what your posting history looks like.
              </p>
            `;
          }
        }

        userDataBreakdown.innerHTML = userDataBreakdownHTML;

        if (userData.format === "mastodon") {
          loadEmbedScript(instanceURL);
        }

        // chartOptions.options.legend = {
        //     display: false
        // };

        const data = {
          labels: posts.map((post) =>
            moment(post.published || post.createdAt || post.created)
          ),
          datasets: [
            {
              label: "Your posts in time",
              data: posts.map((post, index) => {
                return {
                  x: moment(post.published || post.createdAt || post.created),
                  // y: (new Date(post.published || post.createdAt)).getHour() + 1,
                  y: new Date(
                    post.published || post.createdAt || post.created
                  ).getHours(),
                };
              }),
              backgroundColor: ["#ff6384"],
            },
          ],
        };

        new Chart(chartElement, {
          type: "scatter",
          data: data,
          options: {
            scales: {
              x: {
                type: "time",
                position: "bottom",
                ticks: {
                  beginAtZero: false,
                  stepSize: 10,
                },
              },
              y: {
                ticks: {
                  beginAtZero: false,
                  display: false,
                },
                scaleLabel: {
                  display: false,
                  // labelString: chartEl.dataset.axisLabelData
                  // labelString: chartEl.dataset.sourceId ? window.ftfDataviz[parseInt( chartEl.dataset.sourceId )].axis_label_title : ''
                  // labelString: 'Day of the month'
                },
                minorTickInterval: null,
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  // label: (ctx) => ctx.label
                  label: (ctx) => {
                    // console.log(ctx);
                    // console.log(posts[ctx.dataIndex].object.content);
                    return ctx.label;
                  },
                },
              },
            },
          },
        });
      } else {
        loadingAnimation.classList.add("d-none");
        loadingText.classList.add("d-none");
        fileInput.disabled = false;
      }
    });
  }
};

export default handleUpload;
