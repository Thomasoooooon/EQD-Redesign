// ==============================================
// 1. Matter.js (物理演算 & インタラクティブ)
// ==============================================
const container = document.getElementById('fv-canvas-container');

const pedalDataList = [
    { id: 'fv01', name: 'Acapulco Gold', category: 'パワーアンプディストーション', sound: 'audio/fv01.mp3', link: 'https://www.earthquakerdevices.jp/acapulco-gold', texture: 'img/fv-parts/fv01.png' },
    { id: 'fv02', name: 'Afterneath', category: 'ショートディレイリバーブ',    sound: 'audio/fv02.mp3', link: 'https://www.earthquakerdevices.jp/afterneath', texture: 'img/fv-parts/fv02.png' },
    { id: 'fv03', name: 'Aqueduct',  category: 'ビブラート',      sound: 'audio/fv03.mp3',  link: 'https://www.earthquakerdevices.jp/aqueduct', texture: 'img/fv-parts/fv03.png' },
    { id: 'fv04', name: 'Astral Destiny',   category: 'オクターブモジュレーション/リバーブ',  sound: 'audio/fv04.mp3', link: 'https://www.earthquakerdevices.jp/astral-destiny', texture: 'img/fv-parts/fv04.png' },
    { id: 'fv05', name: 'Barrows',   category: 'ファズアタッカー',  sound: 'audio/fv05.mp3', link: 'https://www.earthquakerdevices.jp/barrows', texture: 'img/fv-parts/fv05.png' },
    { id: 'fv06', name: 'Bellows',   category: 'ファズドライバー',  sound: 'audio/fv06.mp3', link: 'https://www.earthquakerdevices.jp/bellows', texture: 'img/fv-parts/fv06.png' },
    { id: 'fv07', name: 'Blumes',   category: 'ベースオーバードライブ',  sound: 'audio/fv07.mp3', link: 'https://www.earthquakerdevices.jp/blumes', texture: 'img/fv-parts/fv07.png' },
    { id: 'fv09', name: 'The Depths',   category: 'アナログオプティカルビブラート',  sound: 'audio/fv09.mp3', link: 'https://www.earthquakerdevices.jp/the-depths', texture: 'img/fv-parts/fv09.png' },
    { id: 'fv10', name: 'Dispatch Master',   category: 'デジタルディレイ＆リバーブ',  sound: 'audio/fv10.mp3', link: 'https://www.earthquakerdevices.jp/dispatch-master', texture: 'img/fv-parts/fv10.png' },
    { id: 'fv11', name: 'Silos',   category: 'マルチジェネレーションディレイ',  sound: 'audio/fv11.mp3', link: 'https://www.earthquakerdevices.jp/silos', texture: 'img/fv-parts/fv11.png' },
    { id: 'fv12', name: 'Ghost Echo',   category: 'ビンテージリバーブ',  sound: 'audio/fv12.mp3', link: 'https://www.earthquakerdevices.jp/ghost-echo', texture: 'img/fv-parts/fv12.png' },
    { id: 'fv13', name: 'Rainbow Machine',   category: 'ポリフォニックピッチシフター',  sound: 'audio/fv13.mp3', link: 'https://www.earthquakerdevices.jp/rainbow-machine', texture: 'img/fv-parts/fv13.png' },
    { id: 'fv14', name: 'Spatial Delivery',   category: 'エンベローブフィルター／サンプル＆ホールド',  sound: 'audio/fv14.mp3', link: 'https://www.earthquakerdevices.jp/spatial-delivery', texture: 'img/fv-parts/fv14.png' },
    { id: 'fv15', name: 'Tentacle',   category: 'アナログオクターブアップ',  sound: 'audio/fv15.mp3', link: 'https://www.earthquakerdevices.jp/tentacle', texture: 'img/fv-parts/fv15.png' },
    { id: 'fv16', name: 'Tone Reaper',   category: 'ファズ',  sound: 'audio/fv16.mp3', link: 'https://www.earthquakerdevices.jp/tone-reaper', texture: 'img/fv-parts/fv16.png' },
    { id: 'fv17', name: 'Zoar',   category: 'ダイナミックディストーション',  sound: 'audio/fv17.mp3', link: 'https://www.earthquakerdevices.jp/zoar', texture: 'img/fv-parts/fv17.png' },
    { id: 'fv18', name: 'Plumes',   category: 'オーバードライブ',  sound: 'audio/fv18.mp3', link: 'https://www.earthquakerdevices.jp/plumes', texture: 'img/fv-parts/fv18.png' },
];

function getResponsiveScale(width) {
    console.log("現在の幅:", width);
    if (width < 768) {
        console.log("→ スマホサイズ適用");
        return 0.8; 
    } else if (width < 1024) {
        console.log("→ タブレットサイズ適用");
        return 1.2; 
    } else {
        console.log("→ PCサイズ適用");
        return 1.6; 
    }
}

let currentAudio = null;
let isPlaying = false;

if (container) {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint,
          Events = Matter.Events,
          Query = Matter.Query,
          Body = Matter.Body; 

    const engine = Engine.create();
    const world = engine.world;
    const width = container.clientWidth;
    const height = container.clientHeight;

    let currentScale = getResponsiveScale(window.innerWidth);

    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: width,
            height: height,
            background: 'transparent',
            wireframes: false
        }
    });

    const ground = Bodies.rectangle(width / 2, height + 60, 20000, 120, { isStatic: true, render: { visible: false } });
    const leftWall = Bodies.rectangle(-60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(width + 60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    Composite.add(world, [ground, leftWall, rightWall]);

    function addFallingObject(x, y, dataId, scale) {
        const data = pedalDataList.find(item => item.id === dataId);
        if (!data) return;

        const radius = 40 * scale;

        const body = Bodies.circle(x, y, radius, { 
            restitution: 0.6, 
            friction: 0.1,
            plugin: { pedalData: data },
            render: {
                sprite: { texture: data.texture, xScale: scale, yScale: scale }
            }
        });
        Composite.add(world, body);
    }

    pedalDataList.forEach((pedal, index) => {
        const x = width * 0.1 + Math.random() * (width * 0.8);
        const y = -100 - (index * 150) - (Math.random() * 100);
        addFallingObject(x, y, pedal.id, currentScale);
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);

    Events.on(mouseConstraint, 'mousedown', function(event) {
        const mousePosition = event.mouse.position;
        const bodies = Composite.allBodies(world);
        const clickedBodies = Query.point(bodies, mousePosition);

        if (clickedBodies.length > 0) {
            const body = clickedBodies[0];
            if (body.plugin && body.plugin.pedalData) {
                updateInfoPanel(body.plugin.pedalData);
            }
        }
    });

    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        render.canvas.width = newWidth;
        render.canvas.height = newHeight;
        render.options.width = newWidth;
        render.options.height = newHeight;

        const newScale = getResponsiveScale(window.innerWidth);

        if (newScale !== currentScale) {
            const scaleFactor = newScale / currentScale;

            const allBodies = Composite.allBodies(world);
            allBodies.forEach(body => {
                if (body.plugin && body.plugin.pedalData) {
                    Body.scale(body, scaleFactor, scaleFactor);         
                    body.render.sprite.xScale = newScale;
                    body.render.sprite.yScale = newScale;
                }
            });

            currentScale = newScale;
        }

        Body.setPosition(rightWall, { x: newWidth + 60, y: newHeight / 2 });
        Body.setPosition(leftWall, { x: -60, y: newHeight / 2 });
        Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 60 });
    });

    Render.run(render);
    const runner = Runner.create();
    
    window.startPhysics = function() {
        Runner.run(runner, engine);
    };
}


// ==============================================
// ★情報パネル & 音声
// ==============================================
const defaultPanel = document.querySelector('.fv-info__default');
const contentPanel = document.querySelector('.fv-info__content');
const nameEl = document.getElementById('info-name');
const catEl = document.getElementById('info-category');
const linkBtn = document.getElementById('btn-detail-link');
const playBtn = document.getElementById('btn-play-demo');
const iconPlay = document.querySelector('.icon-play');
const iconStop = document.querySelector('.icon-stop');

function updateInfoPanel(data) {
    if (!data) return;
    nameEl.textContent = data.name;
    catEl.textContent = data.category;
    linkBtn.href = data.link;

    if (currentAudio) {
        currentAudio.pause();
        isPlaying = false;
        updatePlayIcon();
    }
    if (data.sound) {
        currentAudio = new Audio(data.sound);
        currentAudio.onended = () => {
            isPlaying = false;
            updatePlayIcon();
        };
    } else {
        currentAudio = null;
    }

    if (defaultPanel) defaultPanel.classList.remove('is-active');
    if (contentPanel) {
        contentPanel.classList.remove('is-active');
        setTimeout(() => {
            contentPanel.classList.add('is-active');
        }, 10);
    }
}

if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (!currentAudio) {
            alert("デモ音源がありません");
            return;
        }
        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
        } else {
            currentAudio.play();
            isPlaying = true;
        }
        updatePlayIcon();
    });
}

function updatePlayIcon() {
    if (iconPlay && iconStop) {
        if (isPlaying) {
            iconPlay.style.display = 'none';
            iconStop.style.display = 'inline';
        } else {
            iconPlay.style.display = 'inline';
            iconStop.style.display = 'none';
        }
    }
}

// ==============================================
// ★オープニング動画
// ==============================================
const overlay = document.getElementById('opening-overlay');
const video = document.getElementById('opening-video');

if (overlay && video) {
    document.body.style.overflow = 'hidden';
    video.play().catch(e => console.log("自動再生ブロック:", e));
    video.addEventListener('ended', () => {
        overlay.classList.add('is-hidden');
        document.body.style.overflow = '';
        if (window.startPhysics) window.startPhysics();
        setTimeout(() => {
            overlay.style.display = 'none';
            ScrollTrigger.refresh();
        }, 1000);
    });
} else {
    if (window.startPhysics) window.startPhysics();
}


// ==============================================
// 2. GSAP Sequence (連番アニメーション) - 安定版
// ==============================================
function setupSequence(canvasId, folderName, frameCount, scrollStart = "center center", scrollDistance = 1500, onComplete = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; 

    const context = canvas.getContext("2d");
    
    const currentFrame = index => {
        const number = (index + 1).toString().padStart(4, '0');
        return `img/sequence/${folderName}/${number}.webp`;
    };

    const images = [];
    const seq = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    function render() {
        const img = images[seq.frame];
        if (img && img.complete && img.naturalWidth !== 0) {
            if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
    }

    images[0].onload = render;

    gsap.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: canvas.closest('.product-visual, .artist-visual, .crack-transition'),
            start: scrollStart, 
            end: `+=${scrollDistance}`,
            pin: true,
            scrub: 0.5,
            markers: false,
            onLeave: () => {
                if (onComplete) onComplete();
            }
        },
        onUpdate: render
    });
}

// ==============================================
// ★Plumes専用: 固定スクロール演出 (SP/PC分岐版)
// ==============================================
(function setupPlumesScroll() {
    const canvas = document.getElementById("sequence-plumes");
    const section = document.querySelector(".product-pickup");
    const visual = document.querySelector(".product-visual");
    const texts = document.querySelectorAll(".plumes-text");

    if (!canvas || !section || !visual) return;

    const context = canvas.getContext("2d");
    const frameCount = 40;
    const folderName = "plumes";
    const images = [];
    const seq = { frame: 0 };

    // 1. 画像のプリロード
    const currentFrame = index => {
        const number = (index + 1).toString().padStart(4, '0');
        return `img/sequence/${folderName}/${number}.webp`;
    };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    function render() {
        const img = images[seq.frame];
        if (img && img.complete && img.naturalWidth !== 0) {
            if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
    }
    images[0].onload = render;

    // 2. ScrollTrigger (レスポンシブ分岐)
    ScrollTrigger.matchMedia({
        
        // ▼▼ スマホ (1023px以下) ▼▼
        "(max-width: 1023px)": function() {
            gsap.to(seq, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: canvas,   
                    start: "center center", 
                    end: "+=1500",
                    pin: visual,      
                    scrub: 0.5,
                    markers: false
                },
                onUpdate: render
            });

            texts.forEach(text => {
                gsap.to(text, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: text,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            });
        },

        // ▼▼ PC (1024px以上) ▼▼
        "(min-width: 1024px)": function() {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "center center",
                    end: "+=4000",
                    pin: true,
                    scrub: 0.5,
                    markers: false
                }
            });

            tl.to(seq, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                duration: 2,
                onUpdate: render
            });

            tl.to(texts, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: "power2.out"
            }, ">-0.5");

            tl.to({}, { duration: 0.5 });
        }
    });

})();
// ==============================================
// ★GARY専用: 固定スクロール演出 (SP/PC分岐版)
// ==============================================
(function setupGaryScroll() {
    const canvas = document.getElementById("sequence-gary");
    const section = document.querySelector(".artist-feature");
    const visual = document.querySelector(".artist-visual"); 
    const animElements = document.querySelectorAll(".gary-anim");

    if (!canvas || !section || !visual) return;

    const context = canvas.getContext("2d");
    const frameCount = 70;
    const folderName = "gary";
    const images = [];
    const seq = { frame: 0 };

    // 1. 画像のプリロード
    const currentFrame = index => {
        const number = (index + 1).toString().padStart(4, '0');
        return `img/sequence/${folderName}/${number}.webp`;
    };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    function render() {
        const img = images[seq.frame];
        if (img && img.complete && img.naturalWidth !== 0) {
            if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
    }
    images[0].onload = render;

    // 2. ScrollTrigger (レスポンシブ分岐)
    ScrollTrigger.matchMedia({
        
        // ▼▼ スマホ (1023px以下) ▼▼
        "(max-width: 1023px)": function() {
            gsap.to(seq, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: canvas,     
                    start: "center center", 
                    end: "+=2000",        
                    pin: visual,       
                    scrub: 0.5,
                    markers: false
                },
                onUpdate: render
            });

            animElements.forEach(el => {
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            });
        },

        // ▼▼ PC (1024px以上) ▼▼
        "(min-width: 1024px)": function() {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 20%", 
                    end: "+=5000",
                    pin: true,
                    scrub: 0.5,
                    markers: false
                }
            });

            tl.to(seq, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                duration: 5.0,
                onUpdate: render
            });

            tl.to(animElements, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power2.out"
            });

            tl.to({}, { duration: 1.0 }); 
        }
    });

    setupSequence("sequence-crack",  "crack",  40, "center center", 1500);

})();


// ==============================================
// 3. Swiper
// ==============================================
const artistSwiper = new Swiper('.artist-carousel', {
    slidesPerView: 'auto', 
    spaceBetween: 0, 
    freeMode: true,
    centeredSlides: false,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});


// ==============================================
// 4. Header SVG Switcher
// ==============================================
const headerImg = document.querySelector('.header__current-section img');
const sections = document.querySelectorAll('[data-header-svg]');
const svgBasePath = 'img/typography/'; 

if (headerImg) {
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center', 
            end: 'bottom center', 
            onEnter: () => updateHeader(section),
            onEnterBack: () => updateHeader(section),
        });
    });
}

function updateHeader(section) {
    const filename = section.getAttribute('data-header-svg');
    if (filename && filename !== "undefined") {
        headerImg.src = svgBasePath + filename;
        headerImg.style.opacity = 0;
        setTimeout(() => {
            headerImg.style.opacity = 1;
        }, 50);
    }
}


// ==============================================
// 5. Global Menu
// ==============================================
const menuBtn = document.querySelector('.header__menu-btn');
const globalMenu = document.getElementById('global-menu');

if (menuBtn && globalMenu) {
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('is-active');
        globalMenu.classList.toggle('is-active');
        
        if (globalMenu.classList.contains('is-active')) {
            document.body.style.overflow = 'hidden';
            menuBtn.textContent = 'Close'; 
        } else {
            document.body.style.overflow = '';
            menuBtn.textContent = 'Menu'; 
        }
    });
}


// ==============================================
// 6. Scroll Fade Animation
// ==============================================
const fadeElements = document.querySelectorAll('.js-fade');

fadeElements.forEach(element => {
    gsap.fromTo(element, 
        { opacity: 0, y: 30 }, 
        {
            opacity: 1, 
            y: 0, 
            duration: 1,
            ease: "power2.out", 
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none reverse" 
            }
        }
    );
});


// ==============================================
// Brand Section: アニメーション出し分け
// ==============================================
ScrollTrigger.matchMedia({
    
    // ① PC (1024px以上): ゆらゆら浮遊アニメーション
    "(min-width: 1024px)": function() {
        gsap.utils.toArray('.float-anim').forEach((el) => {
            gsap.to(el, {
                x: "random(-40, 40)", 
                duration: "random(1.0, 2.0)", 
                ease: "power1.inOut", 
                repeat: -1,
                yoyo: true,
                repeatRefresh: true 
            });

            gsap.to(el, {
                y: "random(-40, 40)",
                duration: "random(1.0, 2.0)",
                ease: "power1.inOut",
                repeat: -1,
                yoyo: true,
                repeatRefresh: true,
                delay: "random(0, 0.5)" 
            });
        });
    },

    // ② スマホ (1023px以下)
    "(max-width: 1023px)": function() {
        gsap.utils.toArray('.brand-img-item').forEach((el) => {
            gsap.set(el, { clearProps: "all" });
            
            gsap.fromTo(el, 
                { opacity: 0, y: 30 }, 
                {
                    opacity: 1, 
                    y: 0, 
                    duration: 1,
                    ease: "power2.out", 
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%", 
                        toggleActions: "play none none reverse" 
                    }
                }
            );
        });
    }
});