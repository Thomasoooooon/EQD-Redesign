// ==============================================
// 1. Matter.js (物理演算 & インタラクティブ)
// ==============================================
const container = document.getElementById('fv-canvas-container');

// ★全18個のデータ
const pedalDataList = [
    { id: 'fv01', name: 'Acapulco Gold', category: 'パワーアンプディストーション', sound: 'audio/demo_plumes.mp3', link: '#', texture: 'img/fv-parts/fv01.png' },
    { id: 'fv02', name: 'Afterneath', category: 'ショートディレイリバーブ',    sound: 'audio/demo_afterneath.mp3', link: '#', texture: 'img/fv-parts/fv02.png' },
    { id: 'fv03', name: 'Aqueduct',  category: 'ビブラート',      sound: 'audio/demo_hizumitas.mp3',  link: '#', texture: 'img/fv-parts/fv03.png' },
    { id: 'fv04', name: 'Astral Destiny',   category: 'オクターブモジュレーション/リバーブ',  sound: '', link: '#', texture: 'img/fv-parts/fv04.png' },
    { id: 'fv05', name: 'Barrows',   category: 'ファズアタッカー',  sound: '', link: '#', texture: 'img/fv-parts/fv05.png' },
    { id: 'fv06', name: 'Bellows',   category: 'ファズドライバー',  sound: '', link: '#', texture: 'img/fv-parts/fv06.png' },
    { id: 'fv07', name: 'Blumes',   category: 'ベースオーバードライブ',  sound: '', link: '#', texture: 'img/fv-parts/fv07.png' },
    { id: 'fv08', name: 'Crimson Drive',   category: 'オーバードライブ',  sound: '', link: '#', texture: 'img/fv-parts/fv08.png' },
    { id: 'fv09', name: 'The Depths',   category: 'アナログオプティカルビブラート',  sound: '', link: '#', texture: 'img/fv-parts/fv09.png' },
    { id: 'fv10', name: 'Dispatch Master',   category: 'デジタルディレイ＆リバーブ',  sound: '', link: '#', texture: 'img/fv-parts/fv10.png' },
    { id: 'fv11', name: 'Silos',   category: 'マルチジェネレーションディレイ',  sound: '', link: '#', texture: 'img/fv-parts/fv11.png' },
    { id: 'fv12', name: 'Ghost Echo',   category: 'ビンテージリバーブ',  sound: '', link: '#', texture: 'img/fv-parts/fv12.png' },
    { id: 'fv13', name: 'Rainbow Machine',   category: 'ポリフォニックピッチシフター',  sound: '', link: '#', texture: 'img/fv-parts/fv13.png' },
    { id: 'fv14', name: 'Spatial Delivery',   category: 'エンベローブフィルター／サンプル＆ホールド',  sound: '', link: '#', texture: 'img/fv-parts/fv14.png' },
    { id: 'fv15', name: 'Tentacle',   category: 'アナログオクターブアップ',  sound: '', link: '#', texture: 'img/fv-parts/fv15.png' },
    { id: 'fv16', name: 'Tone Reaper',   category: 'ファズ',  sound: '', link: '#', texture: 'img/fv-parts/fv16.png' },
    { id: 'fv17', name: 'Zoar',   category: 'ダイナミックディストーション',  sound: '', link: '#', texture: 'img/fv-parts/fv17.png' },
    { id: 'fv18', name: 'Plumes',   category: 'オーバードライブ',  sound: '', link: '#', texture: 'img/fv-parts/fv18.png' },
];

const PEDAL_SCALE = 0.6;
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
          Query = Matter.Query;

    const engine = Engine.create();
    const world = engine.world;
    const width = container.clientWidth;
    const height = container.clientHeight;

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

    const ground = Bodies.rectangle(width / 2, height + 60, width, 120, { isStatic: true, render: { visible: false } });
    const leftWall = Bodies.rectangle(-60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(width + 60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    Composite.add(world, [ground, leftWall, rightWall]);

    function addFallingObject(x, y, dataId, scale) {
        const data = pedalDataList.find(item => item.id === dataId);
        if (!data) return;

        const body = Bodies.circle(x, y, 40 * scale, { 
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
        addFallingObject(x, y, pedal.id, PEDAL_SCALE);
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

    // 画像のプリロード
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    function render() {
        const img = images[seq.frame];
        if (img && img.complete && img.naturalWidth !== 0) {
            // キャンバスのサイズを画像に合わせる
            if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
    }

    // 最初の画像だけ先に描画しておく（チラつき防止）
    images[0].onload = render;

    // ScrollTriggerの設定
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
            // ★再生が終わって通り過ぎたら実行（画像を表示する）
            onLeave: () => {
                if (onComplete) onComplete();
            }
        },
        onUpdate: render
    });
}

// 実行設定
setupSequence("sequence-plumes", "plumes", 40, "center center", 1500);

// ★Gary: アニメーション終了後に画像を表示
setupSequence("sequence-gary", "gary", 70, "center 60%", 2625, () => {
    // 画像を表示するクラスを付与
    const garyImg = document.querySelector('.artist-visual__img');
    if (garyImg) garyImg.classList.add('is-visible');
});

setupSequence("sequence-crack",  "crack",  40, "center center", 1500);


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