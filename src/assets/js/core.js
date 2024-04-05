$ID = "shyttt_slider";
$CAROUSEL_CLASS = "shyttt_carousel";
$ITEM_CLASS = "shyttt_item";
$EXTRA_ITEM_CLASS = "shyttt_item--extra";

$PAGINATION_CLASS = "shyttt_pagination";
$PAGINATION_ITEM_CLASS = "shyttt_pagination--item";
$NAVIGATION_NEXT = "shyttt_next";
$NAVIGATION_PREVIOUS = "shyttt_prev";

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
class ShytttSlider {
  constructor(selector, options) {
    this.slider = document.querySelector(selector);
    this.carousel = this.slider.children[0];
    this.opts = options;
    this.activeIndex = 0;
    this.init();
  }
  init() {
    this.slider.classList.add($ID);
    if (this.opts.effect) {
      this.slider.classList.add(this.opts.effect);
    }
    this.carousel.classList.add($CAROUSEL_CLASS);
    this.items = [...this.carousel.children];
    this.render();
    this.carousel.addEventListener("mousedown", this.dragStart.bind(this));
    this.carousel.addEventListener("mousemove", this.dragging.bind(this));
    this.carousel.addEventListener("mouseup", this.dragStop.bind(this));

    window.addEventListener("resize", debounce(this.render.bind(this), 300));
  }

  render() {
    if (this.opts.responsive) {
      const breakpoint = Object.keys(this.opts.responsive)
        .reverse()
        .find((bp) => window.innerWidth >= bp);
      if (breakpoint) {
        this.opts = {
          ...this.opts,
          ...this.opts.responsive[breakpoint],
        };
      }
    }
    this.renderItems();
    this.renderPagination();
    this.renderNavigation();
    this.scrollToIndex(this.activeIndex);
    this.autoplay();
  }

  autoplay() {
    if (!this.opts.autoplay.enable || this.autoplayInterval) return;
    this.autoplayInterval = setInterval(() => {
      if (this.opts.autoplay.random) {
        const randomIndex = Math.floor(
          Math.random() * (this.items.length - this.opts.perPage)
        );
        this.scrollToIndex(randomIndex);
      } else {
        if (this.activeIndex === this.items.length - this.opts.perPage) {
          this.scrollToIndex(0);
        } else {
          this.scrollToIndex(this.activeIndex + 1);
        }
      }
    }, this.opts.autoplay.delay);
  }
  scrollToIndex(index) {
    let totalItems;
    if (this.opts.centerMode) {
      totalItems = this.items.length - 1;
    } else {
      totalItems = this.items.length - this.opts.perPage;
    }
    if (index < 0 || index > totalItems) {
      this.scrollToIndex(this.activeIndex);
      return;
    }
    if (this.opts.autoplay && this.opts.autoplay.enable) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = undefined;
    }
    this.activeIndex = index;
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].classList.toggle("active", i === index);
    }
    const itemWidth = this.items[0].offsetWidth;
    this.carousel.scrollLeft = index * itemWidth + index * this.opts.gap;
    if (this.opts.pagination) {
      const dots = this.pagination.children;
      const activeDot = dots[index];
      for (let i = 0; i < dots.length; i++) {
        if (i !== index) {
          dots[i].classList.remove("active");
        }
      }
      activeDot.classList.add("active");
    }

    if (this.opts.navigation) {
      const prevBtn = this.slider.querySelector(`.${$NAVIGATION_PREVIOUS}`);
      const nextBtn = this.slider.querySelector(`.${$NAVIGATION_NEXT}`);
      if (index === 0) {
        prevBtn.classList.add("hidden");
      } else {
        prevBtn.classList.remove("hidden");
      }
      if (index === totalItems) {
        nextBtn.classList.add("hidden");
      } else {
        nextBtn.classList.remove("hidden");
      }
    }
    this.autoplay();
  }

  renderItems() {
    this.carousel.style.gap = `${this.opts.gap}px`;
    this.items.forEach((item) => {
      item.style.maxWidth = `calc((100% - ${
        (this.opts.perPage - 1) * this.opts.gap
      }px)/ ${this.opts.perPage})`;
      item.classList.add($ITEM_CLASS);
    });
    if (this.opts.centerMode) {
      const itemWidth = this.items[0].offsetWidth;
      const centerPos = this.slider.offsetWidth / 2 - itemWidth / 2;
      this.items[0].style.marginLeft = `${centerPos}px`;
      if (!document.querySelector(`.${$EXTRA_ITEM_CLASS}`)) {
        const extraSpace = document.createElement("div");
        extraSpace.classList.add($EXTRA_ITEM_CLASS);
        extraSpace.style.width = `${centerPos}px`;
        this.carousel.appendChild(extraSpace);
      }
    }
  }

  renderPagination() {
    if (!this.opts.pagination) return;

    const isExisted = this.slider.querySelector(`.${$PAGINATION_CLASS}`);
    if (isExisted) {
      this.pagination.remove();
    }
    this.pagination = document.createElement("ul");
    this.pagination.classList.add($PAGINATION_CLASS);
    let dotsLength;
    if (this.opts.centerMode) {
      dotsLength = this.items.length;
    } else {
      dotsLength = this.items.length - this.opts.perPage + 1;
    }
    for (let i = 0; i < dotsLength; i++) {
      const dot = document.createElement("li");
      dot.classList.add($PAGINATION_ITEM_CLASS);
      dot.addEventListener("click", () => this.scrollToIndex(i));
      this.pagination.appendChild(dot);
    }
    this.slider.appendChild(this.pagination);
  }

  renderNavigation() {
    if (!this.opts.navigation) return;
    const isExisted = this.slider.querySelector(`.${$NAVIGATION_PREVIOUS}`);
    if (isExisted) return;
    const prevBtn = document.createElement("li");
    prevBtn.className = "fas fa-chevron-left";
    prevBtn.classList.add($NAVIGATION_PREVIOUS);
    prevBtn.addEventListener("click", () => {
      this.scrollToIndex(this.activeIndex - 1);
    });
    this.slider.appendChild(prevBtn);

    const nextBtn = document.createElement("li");
    nextBtn.className = "fas fa-chevron-right";
    nextBtn.classList.add($NAVIGATION_NEXT);
    nextBtn.addEventListener("click", () => {
      this.scrollToIndex(this.activeIndex + 1);
    });
    this.slider.appendChild(nextBtn);
  }

  _scroll(e) {
    const diffTime = e.timeStamp - this.scrollAt;
    const maxDiffTime = 1000;
    if (diffTime > maxDiffTime || this.diffX === 0) return;

    if (this.diffX > 0) {
      this.scrollToIndex(this.activeIndex + 1);
    }
    if (this.diffX < 0) {
      this.scrollToIndex(this.activeIndex - 1);
    }
    this.diffX = 0;
  }
  dragStart(e) {
    if (this.opts.autoplay && this.opts.autoplay.enable) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = undefined;
    }
    this.scrollAt = e.timeStamp;
    this.isDragStart = true;
    this.prevPageX = e.pageX;
    this.prevScrollLeft = this.carousel.scrollLeft;
  }

  dragStop(e) {
    if (this.opts.autoplay && this.opts.autoplay.enable) {
      this.autoplay();
    }
    this.isDragStart = false;
    this.carousel.classList.remove("dragging");
    this._scroll(e);
  }

  dragging(e) {
    e.preventDefault();
    if (!this.isDragStart) return;
    this.carousel.classList.add("dragging");
    this.diffX = this.prevPageX - e.pageX;
    this.carousel.scrollLeft = this.prevScrollLeft + this.diffX;
  }
}
window.ShytttSlider = ShytttSlider;
