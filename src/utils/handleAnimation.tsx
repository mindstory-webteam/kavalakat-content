"use client";

const handleAnimation = (): void => {
    const gsap = (window as any).gsap;
    const SplitText = (window as any).SplitText;
    const ScrollTrigger = (window as any).ScrollTrigger;

    if (!gsap || !SplitText || !ScrollTrigger) {
        console.error("GSAP, SplitText, or ScrollTrigger is not loaded.");
        return;
    }

    const arr1: HTMLElement[] = gsap.utils.toArray("#btn_wrapper");
    const arr2: HTMLElement[] = gsap.utils.toArray(".btn_wrapper");
    const all_buttons: HTMLElement[] = arr1.concat(arr2);

    all_buttons.forEach((btn: HTMLElement) => {
        if (!btn.classList.contains("banner-btn")) {
            gsap.from(btn, {
                scrollTrigger: {
                    trigger: btn,
                    start: "top center+=150",
                    markers: false,
                },
                opacity: 0,
                y: -70,
                ease: "bounce",
                duration: 1.5,
            });
        }
    });

    // Title Animation
    const splitTitleLines: HTMLElement[] = gsap.utils.toArray(".text-animation");
    splitTitleLines.forEach((splitTextLine: HTMLElement) => {
        const tl2 = gsap.timeline({
            scrollTrigger: {
                trigger: splitTextLine,
                start: "top 90%",
                end: "bottom 60%",
                scrub: false,
                markers: false,
                toggleActions: "play none none none",
            },
        });

        const itemSplitted = new SplitText(splitTextLine, { type: "words, lines" });
        gsap.set(splitTextLine, { perspective: 400 });
        itemSplitted.split({ type: "lines" });
        tl2.from(itemSplitted.lines, {
            duration: 1,
            delay: 0.3,
            opacity: 0,
            rotationX: -80,
            force3D: true,
            transformOrigin: "top center -50",
            stagger: 0.1,
        });
    });

    // Text Animation
    const splitTextLines: HTMLElement[] = gsap.utils.toArray(".text-animation p");
    splitTextLines.forEach((splitTextLine: HTMLElement) => {
        const tl3 = gsap.timeline({
            scrollTrigger: {
                trigger: splitTextLine,
                start: "top 90%",
                end: "bottom 60%",
                scrub: false,
                markers: false,
                toggleActions: "play none none none",
            },
        });

        const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
        gsap.set(splitTextLine, { perspective: 400 });
        itemSplitted.split({ type: "lines" });
        tl3.from(itemSplitted.lines, {
            duration: 1,
            delay: 0.5,
            opacity: 0,
            rotationX: -80,
            force3D: true,
            transformOrigin: "top center -50",
            stagger: 0.1,
        });
    });

    // Combined Reveal and Zoom-In Animation
    const imageRevealElements: NodeListOf<HTMLElement> = document.querySelectorAll(".image-reveal");
    imageRevealElements.forEach((element: HTMLElement) => {
        const imgElement = element.querySelector("img") as HTMLElement;
        if (!imgElement) return;

        const hasZoomEffect = element.classList.contains("wcf--image-effect-zoom-in");

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: "top 75%",
                toggleActions: "play none none none",
            },
        });

        timeline.from(imgElement, {
            xPercent: -100,
            autoAlpha: 0,
            duration: 2.5,
            ease: "power2.out",
        });

        if (hasZoomEffect) {
            timeline.fromTo(
                imgElement,
                { scale: 1.3 },
                {
                    scale: 1.1,
                    duration: 1.5,
                    ease: "power2.out",
                },
                "<"
            );
        }
    });
};

export default handleAnimation;
