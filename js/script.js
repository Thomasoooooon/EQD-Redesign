// ==============================================
// 1. Matter.js (物理演算 & インタラクティブ)
// ==============================================
const container = document.getElementById('fv-canvas-container');

// ★ペダルのデータリスト
const pedalDataList = [
    { id: 'fv01', name: 'Plumes', category: 'Overdrive', sound: 'audio/demo_plumes.mp3', link: '#', texture: 'img/fv-parts/fv01.png' },
    { id: 'fv02', name: 'Afterneath', category: 'Reverb', sound: 'audio/demo_afterneath.mp3', link: '#', texture: 'img/fv-parts/fv02.png' },
    { id: 'fv03', name: 'Hizumitas', category: 'Fuzz', sound: 'audio/demo_hizumitas.mp3', link: '#', texture: 'img/fv-parts/fv03.png' },
    // 必要に応じて追加してください
];

// 音源再生用の変数
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

    // 壁と床
    const ground = Bodies.rectangle(width / 2, height + 60, width, 120, { isStatic: true, render: { visible: false } });
    const leftWall = Bodies.rectangle(-60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(width + 60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    Composite.add(world, [ground, leftWall, rightWall]);

    // 物体追加関数
    function addFallingObject(x, y, dataId, scale = 1) {
        const data = pedalDataList.find(item => item.id === dataId);
        const textureUrl = data ? data.texture : 'img/fv-parts/fv01.png';

        const body = Bodies.circle(x, y, 40 * scale, { 
            restitution: 0.6, 
            friction: 0.1,
            plugin: { pedalData: data },
            render: {
                sprite: { texture: textureUrl, xScale: scale, yScale: scale }
            }
        });
        Composite.add(world, body);
    }

    // 物体の投入
    addFallingObject(width * 0.4, -100, 'fv01', 0.8);
    addFallingObject(width * 0.6, -200, 'fv02', 0.8);
    addFallingObject(width * 0.2, -300, 'fv03', 0.5);
    addFallingObject(width * 0.8, -400, 'fv01', 0.6); 
    addFallingObject(width * 0.5, -500, 'fv02', 0.7);

    // マウス操作 & クリック判定
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
    
    // オープニング後に実行する関数を定義
    window.startPhysics = function() {
        Runner.run(runner, engine);
    };
}


// ==============================================
// ★情報パネルの制御 & 音声再生
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
// ★オープニング動画の制御 (修正済み)
// ==============================================
const overlay = document.getElementById('opening-overlay');
const video = document.getElementById('opening-video');

if (overlay && video) {
    // 1. 最初はスクロール禁止
    document.body.style.overflow = 'hidden';

    // 2. 動画再生
    video.play().catch(e => console.log("自動再生ブロック:", e));

    // 3. 動画終了時の処理（★ここをコメントアウトから復活させました！）
    video.addEventListener('ended', () => {
        // フェードアウト
        overlay.classList.add('is-hidden');
        
        // スクロール解禁
        document.body.style.overflow = '';
        
        // 物理演算スタート
        if (window.startPhysics) {
            window.startPhysics();
        }

        // 要素を完全に消す
        setTimeout(() => {
            overlay.style.display = 'none';
            // ★重要: レイアウトが変わった可能性があるのでScrollTriggerを更新
            ScrollTrigger.refresh();
        }, 1000);
    });
} else {
    // 動画がない場合は即スタート
    if (window.startPhysics) window.startPhysics();
}


// ==============================================
// 2. GSAP Sequence (連番アニメーション)
// ==============================================
function setupSequence(canvasId, folderName, frameCount, scrollStart = "center center", scrollDistance = 1500) {
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
            markers: false
        },
        onUpdate: render
    });
}

// 実行設定
setupSequence("sequence-plumes", "plumes", 40, "center center", 1500);
setupSequence("sequence-gary",   "gary",   70, "center 60%", 3000);
setupSequence("sequence-crack",  "crack",  40, "center center", 1500);


// ==============================================
// 3. Swiper (アーティストカルーセル)
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
// 4. Header SVG Switcher (スクロールで文字変更)
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
// 5. Global Menu Toggle (メニュー開閉)
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
// 6. Scroll Fade Animation (ふわっと表示)
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