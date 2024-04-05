window.onload = () => {
  const slider = new ShytttSlider("#slider", {
    perPage: 3,
    gap: 10,
    pagination: false,
    navigation: false,
    effect: "coverflow",
    autoplay: {
      enable: false,
      delay: 2000,
      random: false,
    },
    centerMode: true,
    responsive: {
      0: {
        perPage: 2,
        gap: 10,
      },
      768: {
        perPage: 3,
        gap: 20,
      },
      1024: {
        perPage: 5,
        gap: 30,
      },
    },
  });
};
