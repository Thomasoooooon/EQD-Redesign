// ==============================================
// 1. Matter.js (物理演算 & インタラクティブ)
// ==============================================
const container = document.getElementById('fv-canvas-container');

// ★全18個のデータ
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

// ★関数: 画面幅に応じたスケールを計算する
function getResponsiveScale(width) {
    // コンソールに今の幅と判定を表示（F12のConsoleタブで確認できます）
    console.log("現在の幅:", width);

    if (width < 768) {
        console.log("→ スマホサイズ適用");
        return 0.8; 
    } else if (width < 1024) {
        console.log("→ タブレットサイズ適用");
        // ★ここも一時的に大きくして、変化するか確認！
        return 1.2; 
    } else {
        console.log("→ PCサイズ適用");
        // ★まずは 2.5 (2.5倍) くらいで試すのがおすすめ！
        // 10.0 だと大きすぎて画面から消えることがあります
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

    // 現在のスケールを初期化
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

    // 床と壁
    const ground = Bodies.rectangle(width / 2, height + 60, 20000, 120, { isStatic: true, render: { visible: false } });
    const leftWall = Bodies.rectangle(-60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(width + 60, height / 2, 120, height * 2, { isStatic: true, render: { visible: false } });
    Composite.add(world, [ground, leftWall, rightWall]);

    // ペダル生成関数
    function addFallingObject(x, y, dataId, scale) {
        const data = pedalDataList.find(item => item.id === dataId);
        if (!data) return;

        // ★サイズ計算: 基本サイズ40px × スケール
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

    // 初回生成
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

    // ★リサイズ時の処理（壁の移動 ＆ ペダルの拡大縮小）
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        // 1. 描画エリア更新
        render.canvas.width = newWidth;
        render.canvas.height = newHeight;
        render.options.width = newWidth;
        render.options.height = newHeight;

        // 2. 新しいスケールを計算
        const newScale = getResponsiveScale(window.innerWidth);

        // 3. スケールが変わっていたら、全ペダルを拡大縮小する
        if (newScale !== currentScale) {
            // 倍率を計算 (例: 0.6 -> 1.0 なら 約1.66倍にする)
            const scaleFactor = newScale / currentScale;

            const allBodies = Composite.allBodies(world);
            allBodies.forEach(body => {
                // ペダルだけを対象にする（壁や床は除外）
                if (body.plugin && body.plugin.pedalData) {
                    // 物理演算上のサイズを変更
                    Body.scale(body, scaleFactor, scaleFactor);
                    
                    // 見た目（画像）のサイズを変更
                    body.render.sprite.xScale = newScale;
                    body.render.sprite.yScale = newScale;
                }
            });

            // 現在のスケールを更新
            currentScale = newScale;
        }

        // 4. 壁と床の位置調整
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
// ==============================================
// ★Plumes専用: 固定スクロール演出 (Pin & Timeline)
// ==============================================
(function setupPlumesScroll() {
    const canvas = document.getElementById("sequence-plumes");
    const section = document.querySelector(".product-pickup");
    // Plumesの文字たちを取得
    const texts = document.querySelectorAll(".plumes-text");

    if (!canvas || !section) return;

    const context = canvas.getContext("2d");
    const frameCount = 40; // 画像の枚数
    const folderName = "plumes";

    // 1. 画像のプリロード
    const images = [];
    const seq = { frame: 0 };

    const currentFrame = index => {
        const number = (index + 1).toString().padStart(4, '0');
        return `img/sequence/${folderName}/${number}.webp`;
    };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    // 描画関数
    function render() {
        const img = images[seq.frame];
        if (img && img.complete && img.naturalWidth !== 0) {
            // キャンバスサイズ調整
            if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
    }
    
    // 最初の1枚目を描画
    images[0].onload = render;

    // 2. タイムラインの作成
    // ここで「動きの順番」を作ります
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,       // このセクションが画面に来たら
            start: "center center", // 真ん中に来たらスタート
            end: "+=4000",          // スクロール距離（長いほどゆっくり動く）
            pin: true,              // ★画面を固定する！
            scrub: 0.5,             // スクロールに連動させる
            markers: false          // 確認用マーカー（完成したらfalse）
        }
    });

    // 動き①: 画像をパラパラ再生
    tl.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        duration: 2,   // 全体の時間の 2/3 を画像再生に使う
        onUpdate: render
    });

    // 動き②: 文字を順番にフワッと表示
    tl.to(texts, {
        opacity: 1,
        y: 0,
        stagger: 0.1,  // 0.1秒ずつずらして表示
        duration: 0.5, // 0.5の時間をかけて表示
        ease: "power2.out"
    }, ">-0.5"); // 画像が終わる0.5秒前から文字を出し始める（スムーズにするため）

    // 動き③: 最後に少し余韻（何もしない時間）を作る
    tl.to({}, { duration: 0.5 }); 

})();

// ==============================================
// ★GARY専用: 固定スクロール演出
// ==============================================
(function setupGaryScroll() {
    const canvas = document.getElementById("sequence-gary");
    const section = document.querySelector(".artist-feature");
    // 文字、背景、そして移動した画像もまとめて取得
    const animElements = document.querySelectorAll(".gary-anim"); 

    if (!canvas || !section) return;

    const context = canvas.getContext("2d");
    const frameCount = 70;
    const folderName = "gary";

    // 1. 画像のプリロード
    const images = [];
    const seq = { frame: 0 };

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

    // 2. タイムライン作成
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 20%", // PCで見やすい位置で固定開始
            end: "+=5000",    // スクロール距離はたっぷりと
            pin: true,
            scrub: 0.5,
            markers: false
        }
    });

    // 動き①: 画像再生（ここをゆっくりに！）
    tl.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        // ★変更: 2.5秒 -> 5.0秒 に変更して、すごくゆっくりにする
        duration: 5.0, 
        onUpdate: render
    });

    // ★削除: 画像を個別に表示させるコードは不要になったので消しました

    // 動き②: 文字・背景・画像をまとめてフワッと表示
    tl.to(animElements, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8, // 少しゆったり表示
        ease: "power2.out"
    }); // タイミング調整（"<"）を外して、アニメ終了後に自然に出るように変更

    // 動き③: 余韻
    tl.to({}, { duration: 1.0 }); 

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
// Brand Section: Floating Images (自由自在＆スピードアップ版)
// ==============================================
gsap.utils.toArray('.float-anim').forEach((el) => {
    
    // ① X軸（左右）: 毎回違う場所へ、素早く移動
    gsap.to(el, {
        // -40px 〜 +40px の広い範囲でランダムな場所へ
        x: "random(-40, 40)", 
        
        // 1秒〜2秒でサッと動く（かなり速くなります！）
        duration: "random(1.0, 2.0)", 
        
        ease: "power1.inOut", // ふわっとしつつもキビキビ動く
        repeat: -1,
        yoyo: true,
        
        // ★最重要: これがあるため、毎回違う場所へ向かって動きます
        repeatRefresh: true 
    });

    // ② Y軸（上下）: X軸とは違うリズムで動かす
    gsap.to(el, {
        y: "random(-40, 40)",
        duration: "random(1.0, 2.0)",
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
        
        // 開始タイミングを少しずらしてバラバラ感を出す
        delay: "random(0, 0.5)" 
    });
});