const revealElements = document.querySelectorAll("[data-reveal]");
const counterElements = document.querySelectorAll("[data-target]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const animateCounter = (element) => {
  const target = Number(element.dataset.target);
  const duration = 1400;
  const startTime = performance.now();

  const step = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(eased * target).toLocaleString("en-IN");

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = target.toLocaleString("en-IN");
    }
  };

  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.45 }
);

counterElements.forEach((counter) => counterObserver.observe(counter));

const feedbackTrack = document.getElementById("feedbackTrack");
const feedbackSlides = feedbackTrack ? Array.from(feedbackTrack.children) : [];
const feedbackDotsHost = document.getElementById("feedbackDots");
const prevButton = document.getElementById("prevFeedback");
const nextButton = document.getElementById("nextFeedback");
let feedbackIndex = 0;
let feedbackTimer = null;

const renderFeedback = () => {
  if (!feedbackTrack || feedbackSlides.length === 0) {
    return;
  }

  feedbackTrack.style.transform = `translateX(-${feedbackIndex * 100}%)`;

  if (feedbackDotsHost) {
    const dots = feedbackDotsHost.querySelectorAll("button");
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === feedbackIndex);
      dot.setAttribute("aria-selected", index === feedbackIndex ? "true" : "false");
    });
  }
};

const moveFeedback = (direction) => {
  if (feedbackSlides.length === 0) {
    return;
  }

  feedbackIndex = (feedbackIndex + direction + feedbackSlides.length) % feedbackSlides.length;
  renderFeedback();
};

const resetFeedbackTimer = () => {
  if (feedbackTimer) {
    clearInterval(feedbackTimer);
  }

  if (feedbackSlides.length > 1) {
    feedbackTimer = setInterval(() => moveFeedback(1), 4800);
  }
};

if (feedbackDotsHost && feedbackSlides.length > 0) {
  feedbackSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show feedback ${index + 1}`);
    dot.addEventListener("click", () => {
      feedbackIndex = index;
      renderFeedback();
      resetFeedbackTimer();
    });
    feedbackDotsHost.appendChild(dot);
  });
}

if (prevButton) {
  prevButton.addEventListener("click", () => {
    moveFeedback(-1);
    resetFeedbackTimer();
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    moveFeedback(1);
    resetFeedbackTimer();
  });
}

renderFeedback();
resetFeedbackTimer();

const manufacturingVideos = document.querySelectorAll(".manufacturing-frame video");

const playManufacturingVideo = (video) => {
  if (video.dataset.autoPlayState === "playing") {
    return;
  }

  if (video.ended || video.dataset.autoPlayState === "ended") {
    video.currentTime = 0;
  }

  video.muted = true;
  video.playsInline = true;
  video.dataset.autoPlayState = "playing";

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      video.dataset.autoPlayState = "idle";
    });
  }
};

manufacturingVideos.forEach((video) => {
  video.dataset.autoPlayState = "idle";
  video.addEventListener("ended", () => {
    video.dataset.autoPlayState = "ended";
    video.pause();
  });
});

if (manufacturingVideos.length > 0) {
  const manufacturingVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          playManufacturingVideo(video);
        }
      });
    },
    { threshold: [0, 0.35, 0.75] }
  );

  manufacturingVideos.forEach((video) => manufacturingVideoObserver.observe(video));
}

document.getElementById("year").textContent = new Date().getFullYear();
