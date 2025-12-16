// ==============================================
// 1. Matter.js (物理演算) & Opening Animation
// ==============================================
const container = document.getElementById('fv-canvas-container');

if (container) {
    // --- Matter.js の準備 (まだ動かしません) ---
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint;

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

    // マウス操作
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);

    // パーツ追加関数
    function addFallingObject(x, y, textureUrl, scale = 1) {
        const body = Bodies.circle(x, y, 40 * scale, { 
            restitution: 0.6, 
            friction: 0.1,
            render: {
                sprite: { texture: textureUrl, xScale: scale, yScale: scale }
            }
        });
        Composite.add(world, body);
    }

    // パーツの準備 (まだ落としません。空中にセットだけします)
    addFallingObject(width * 0.4, -100, 'img/fv-parts/fv01.png', 0.8);
    addFallingObject(width * 0.6, -200, 'img/fv-parts/fv02.png', 0.8);
    addFallingObject(width * 0.2, -300, 'img/fv-parts/fv03.png', 0.5);
    addFallingObject(width * 0.8, -400, 'img/fv-parts/fv04.png', 0.6); 
    addFallingObject(width * 0.5, -500, 'img/fv-parts/fv05.png', 0.7);
    addFallingObject(width * 0.4, -100, 'img/fv-parts/fv06.png', 0.8);
    addFallingObject(width * 0.6, -200, 'img/fv-parts/fv07.png', 0.8);
    addFallingObject(width * 0.2, -300, 'img/fv-parts/fv08.png', 0.5);
    addFallingObject(width * 0.8, -400, 'img/fv-parts/fv09.png', 0.6); 
    addFallingObject(width * 0.5, -500, 'img/fv-parts/fv10.png', 0.7);
    addFallingObject(width * 0.4, -100, 'img/fv-parts/fv11.png', 0.8);
    addFallingObject(width * 0.6, -200, 'img/fv-parts/fv12.png', 0.8);
    addFallingObject(width * 0.2, -300, 'img/fv-parts/fv13.png', 0.5);
    addFallingObject(width * 0.8, -400, 'img/fv-parts/fv14.png', 0.6); 
    addFallingObject(width * 0.5, -500, 'img/fv-parts/fv15.png', 0.7);
    addFallingObject(width * 0.5, -500, 'img/fv-parts/fv16.png', 0.7);


    // ★ここからオープニングの制御
    const overlay = document.getElementById('opening-overlay');
    const video = document.getElementById('opening-video');

    // 物理演算をスタートさせる関数
    function startSimulation() {
        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);
    }

    if (overlay && video) {
        // 1. 最初はスクロール禁止にする
        document.body.style.overflow = 'hidden';

        // 2. 動画を再生 (スマホの省電力モード対策でcatchを入れる)
        video.play().catch(e => console.log("自動再生がブロックされました:", e));

        // 3. 動画が終わったら実行
        video.addEventListener('ended', () => {
            // フェードアウト開始
            overlay.classList.add('is-hidden');
            
            // スクロール解禁
            document.body.style.overflow = '';

            // 物理演算スタート！
            startSimulation();

            // フェードアウトが終わった頃(1秒後)に要素を完全に消す
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1000);
        });

    } else {
        // 動画がない場合(開発中など)はすぐにスタート
        startSimulation();
    }
}

// ==============================================
// 2. GSAP Sequence (連番アニメーション) - 修正版
// ==============================================

// ★修正点：第5引数 scrollDistance を追加しました
function setupSequence(canvasId, folderName, frameCount, scrollStart = "center center", scrollDistance = 1500) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; 

    const context = canvas.getContext("2d");
    
    // 画像生成ルール (0001.webp)
    const currentFrame = index => {
        const number = (index + 1).toString().padStart(4, '0');
        return `img/sequence/${folderName}/${number}.webp`;
    };

    const images = [];
    const seq = { frame: 0 };

    // 画像プリロード
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    function render() {
        const img = images[seq.frame];
        // 読み込み完了＆画像破損チェック
        if (img && img.complete && img.naturalWidth !== 0) {
            // サイズ自動調整
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
            
            // 引数で受け取った位置を使う
            start: scrollStart, 
            
            // 引数で受け取った距離を使う
            end: `+=${scrollDistance}`,
            
            pin: true,
            scrub: 0.5,
            markers: false
        },
        onUpdate: render
    });
}


// ★ユーザー設定（枚数や速度の設定はそのまま残しています）
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
        // 最初の状態（透明で、少し下にいる）
        { 
            opacity: 0, 
            y: 30 
        }, 
        // アニメーション後の状態（不透明で、元の位置に戻る）
        {
            opacity: 1, 
            y: 0, 
            duration: 1,    // 1秒かけて
            ease: "power2.out", // 自然な減速
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // 画面の下の方(85%)に来たら開始
                // markers: true, // 動きを確認したい時はコメント外す
                toggleActions: "play none none reverse" // 上に戻ったらまた消える設定（好みで "play none none none" にすれば一度きり）
            }
        }
    );
});