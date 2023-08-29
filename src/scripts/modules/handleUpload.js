import sortArrayOfObjects from "/js/modules/sortArrayOfObjects.min.js";
import loadEmbedScript from "/js/modules/loadEmbedScript.min.js";
import Cookie from "/js/cookies/main.min.js";

const cookieManager = new Cookie();
const fileInput = document.getElementById("file-input");
const introElement = document.getElementById("intro");
const loadingAnimation = document.getElementById("loading-animation");
const resultsElement = document.getElementById("results");
const userInfo = document.getElementById("user-info");
const userAvatar = document.getElementById("user-avatar");
const userDescription = document.getElementById("user-description");
const userDataBreakdown = document.getElementById("user-data-breakdown");
const chartElement = document.getElementById("chart");

const handleUpload = () => {
  if (fileInput) {
    fileInput.addEventListener("change", async (ev) => {
      loadingAnimation.classList.remove('d-none');
      const formData = new FormData();
      formData.set("archive", fileInput.files[0]);

      const resp = await fetch("/extract-data", {
        method: "POST",
        body: formData,
      });

      const response = await resp.json();
      console.log(response);

      if (response && response.data) {
        introElement.classList.add("d-none");
        resultsElement.classList.remove("d-none");
        const userData = response.data;

        let userDescriptionHTML = '';
        let userDataBreakdownHTML = '';

        if (userData.actor){
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
          userAvatar.innerHTML = `
            <img class="img-thumbnail" width="64" height="64" src="data:image/jpg;base64,${userData.avatar}">
          `;
        } else {
          userInfo.remove();
          userDescription.remove();
        }

        let posts = [],
          firstPost,
          postCount = 0;

        if (userData?.outbox?.orderedItems) {
          posts = userData.outbox.orderedItems;
        } else if (userData?.outbox){
          posts = userData.outbox;          
        }
        
        postCount = posts.length;
        if (postCount) {
          // posts = sortArrayOfObjects(posts, key, desc)
          firstPost = posts[0];
        }
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };

        if (userData.actor){
          const accountCreationDate = moment(userData.actor.published);
          const today = moment();
          const timeAgo = today.diff(accountCreationDate, 'days');
          
  
          userDataBreakdownHTML += `
          <p>
            You created your account on <strong>${new Date(userData.actor.published).toLocaleDateString(
              undefined,
              options
            )}</strong>, which is <strong>${timeAgo.toLocaleString()} day(s) ago</strong>. Since then, you posted <strong>${postCount.toLocaleString()} times</strong>, or about ${(Math.round(postCount/timeAgo)).toLocaleString()} time(s) a day on average.
          </p>
          `;
        }

        let instanceURL;

        if (userData.format === 'mastodon'){
          if (firstPost) {
            const postURL = firstPost?.object?.id || firstPost?.id;
            const url = new URL(postURL);
            instanceURL = `${url.protocol}//${url.hostname}`


            userDataBreakdownHTML += `
              <p>
                Here's your <a href="${postURL}" target="_blank">first post</a>!
              </p>
            `;

            userDataBreakdownHTML += `
              <iframe
                src="${postURL}/embed"
                class="mastodon-embed"
                style="max-width: 100%; border: 0" width="400"
                allowfullscreen="allowfullscreen"></iframe>
            `;
          }

          userDataBreakdownHTML += `
            <p class="mt-4">
              And this is what your posting history looks like.
            </p>
          `;
        } else {
          userDataBreakdownHTML += `
            <p>
              Here's what your posting history looks like.
            </p>
          `;
        }
          
        userDataBreakdown.innerHTML = userDataBreakdownHTML;

        if (userData.format === 'mastodon'){
          loadEmbedScript(instanceURL);
        }

        // chartOptions.options.legend = {
        //     display: false
        // };

        const data = {
          labels: posts.map((post) => moment(post.published || post.createdAt)),
          datasets: [
            {
              label: "Your posts in time",
              data: posts.map((post, index) => {
                return {
                  x: moment(post.published || post.createdAt),
                  // y: (new Date(post.published || post.createdAt)).getHour() + 1,
                  y: (new Date(post.published || post.createdAt)).getHours(),
                };
              }),
              backgroundColor: ['#ff6384']
            },
          ],
        };

        new Chart(chartElement, {
          type: "scatter",
          data : data,
          options: {
            scales: {
              x: 
                {
                  type: "time",
                  position: "bottom",
                  ticks: {
                    beginAtZero: false,
                    stepSize: 10,
                  },
                },
              y: 
                {
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

            // scales: {
            //   x: {
            //     type: 'linear',
            //     position: 'bottom'
            //   }
            // }
          },
        });
      } else {
        loadingAnimation.classList.add('d-none');
      }
    });
  }
};

export default handleUpload;
