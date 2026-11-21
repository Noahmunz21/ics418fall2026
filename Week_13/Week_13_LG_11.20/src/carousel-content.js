/* Administrator content for the Home carousel.
   Copy, remove, or move an entire entry to change the carousel.
   Keep text short. The image, its description, and the section link are optional.
   Put images in assets/. A destination is an existing section ID without #. */
window.KioskCarouselContent = [
  // Carousel 1
  {
    title: "Explore UH Maui College",
    text: "Find degrees and certificates offered by the Business Department.",
    image: "assets/Slideshow_Image_1.jpg",
    imageAlt: "UHMC students on campus",
    destination: "programs",
    linkText: "Programs"
  },
  // Carousel 2
  {
    title: "Find your way around Ka Lama",
    text: "Use the Building Directory to find a room, restroom, elevator, or stairs.",
    image: "assets/Slideshow_Image_3.jpg",
    imageAlt: "UHMC campus building",
    destination: "directory",
    linkText: "Building Directory"
  },
  // Carousel 3: academicToday fills this slide from the official Academic Calendar.
  {
    title: "Today's Academic Events",
    text: "",
    academicToday: true,
    destination: "events",
    linkText: "View Academic Calendar"
  }
];
