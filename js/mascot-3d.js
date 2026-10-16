/* ==========================================================================
   FILE: js/mascot-3d.js
   MÔ TẢ: Linh Vật 3D Mini Nhảy Múa (Three.js WebGL) — Tỷ lệ Bé Bé Mini Kawaii
          Đúng chuẩn tạo hình Thỏ Hồng Mini Chibi ôm bó hoa hồng như lúc đầu:
          - Kích thước nhỏ nhắn, mũm mĩm (Mini Scale 0.62) nằm gọn giữa sân khấu
          - Đầu tròn phúng phính, 1 tai dựng + 1 tai cụp dễ thương, mắt tròn to
            long lanh, miệng cười lộ răng thỏ trắng nhỏ xinh, má hồng phớt
          - Tay ngắn mũm mĩm ôm bó hoa hồng pastel, chân ngắn nhún nhảy
          - Có thể chuyển đổi nhanh giữa:
            1. Thỏ Hồng 3D Mini (WebGL 3D Render xoay 360°)
            2. Búp Bê Chibi 3D Mini (WebGL 3D Render xoay 360°)
            3. Thỏ Hồng 3D Studio Gốc (Bản lúc đầu)
   ========================================================================== */

window.Mascot3DEngine = (function () {
  'use strict';

  let scene = null;
  let camera = null;
  let renderer = null;

  let rootGroup = null;
  let bunnyModelGroup = null;
  let chibiGirlModelGroup = null;

  // Khớp của Thỏ Hồng Mini 3D (Bunny Rig)
  let bBodyGroup = null;
  let bHeadGroup = null;
  let bLeftEar = null;
  let bRightEar = null;
  let bRightEarTip = null;
  let bLeftArm = null;
  let bRightArm = null;
  let bLeftLeg = null;
  let bRightLeg = null;
  let bLeftEye = null;
  let bRightEye = null;

  // Khớp của Búp Bê Chibi Mini 3D (Mini Chibi Girl Rig)
  let cBodyGroup = null;
  let cHeadGroup = null;
  let cLeftArm = null;
  let cRightArm = null;
  let cLeftLeg = null;
  let cRightLeg = null;
  let cSkirtMat = null;

  let heartParticlesGroup = null;
  let stageRing = null;

  let activeCharacterStyle = 'bunny'; // 'bunny' | 'chibi'
  let currentDanceMode = 1;
  let jumpImpulse = 0;
  let userRotationY = 0;
  let isDragging3D = false;
  let prevPointerX = 0;
  let clockStart = Date.now();

  function createHeartShape() {
    const x = 0, y = 0;
    const heartShape = new window.THREE.Shape();
    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.15, y + 0.77, x + 0.25, y + 0.95);
    heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return heartShape;
  }

  function buildMiniBouquet() {
    const bq = new window.THREE.Group();
    const wrapMat = new window.THREE.MeshStandardMaterial({ color: 0xfff5f7, roughness: 0.35 });
    const stemMat = new window.THREE.MeshStandardMaterial({ color: 0x84a98c, roughness: 0.5 });

    const stems = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(0.08, 0.06, 0.35, 12),
      stemMat
    );
    stems.position.y = -0.15;
    bq.add(stems);

    const wrap = new window.THREE.Mesh(
      new window.THREE.ConeGeometry(0.28, 0.42, 18),
      wrapMat
    );
    wrap.rotation.x = Math.PI;
    bq.add(wrap);

    const roseColors = [0xff8fab, 0xfb6f92, 0xffb3c6, 0xffc2d1, 0xf43f5e];
    const roseCoords = [
      [0, 0.22, 0],
      [-0.14, 0.19, 0.1],
      [0.14, 0.19, 0.1],
      [-0.1, 0.2, -0.12],
      [0.1, 0.2, -0.12]
    ];
    roseCoords.forEach((rc, idx) => {
      const roseGroup = new window.THREE.Group();
      roseGroup.position.set(rc[0], rc[1], rc[2]);
      const rMat = new window.THREE.MeshStandardMaterial({
        color: roseColors[idx % roseColors.length],
        roughness: 0.32
      });
      const outerBloom = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.11, 16, 16), rMat);
      outerBloom.scale.set(1.1, 0.85, 1.1);
      roseGroup.add(outerBloom);
      const innerBud = new window.THREE.Mesh(
        new window.THREE.TorusGeometry(0.05, 0.025, 10, 18),
        new window.THREE.MeshStandardMaterial({ color: 0xffe5ec, roughness: 0.3 })
      );
      innerBud.rotation.x = Math.PI / 2;
      innerBud.position.y = 0.07;
      roseGroup.add(innerBud);
      bq.add(roseGroup);
    });

    return bq;
  }

  function init3DMascot(containerId) {
    const container = document.getElementById(containerId);
    if (!container || typeof window.THREE === 'undefined') return false;

    container.innerHTML = '';
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    scene = new window.THREE.Scene();
    camera = new window.THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    // Đặt camera xa hơn để nhân vật 3D trông nhỏ nhắn "bé bé mini" cực đáng yêu
    camera.position.set(0, 0.35, 7.6);
    camera.lookAt(0, 0.05, 0);

    renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Ánh sáng Pastel Vinyl Studio mềm mại như ảnh gốc
    const ambientLight = new window.THREE.AmbientLight(0xfff0f3, 0.92);
    scene.add(ambientLight);

    const keyLight = new window.THREE.DirectionalLight(0xffffff, 0.88);
    keyLight.position.set(3.5, 6.0, 5.5);
    scene.add(keyLight);

    const rimLight = new window.THREE.PointLight(0xff8fab, 0.75, 14);
    rimLight.position.set(-3.5, 2.5, -2.5);
    scene.add(rimLight);

    const warmLight = new window.THREE.PointLight(0xfde68a, 0.5, 12);
    warmLight.position.set(2.5, -2.0, 3.5);
    scene.add(warmLight);

    // Bệ đứng Mini tròn xinh xắn dưới chân
    const stageGroup = new window.THREE.Group();
    stageGroup.position.y = -1.15;
    scene.add(stageGroup);

    const stageBase = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(1.05, 1.18, 0.12, 40),
      new window.THREE.MeshStandardMaterial({ color: 0xffd6e0, roughness: 0.35 })
    );
    stageGroup.add(stageBase);

    stageRing = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(1.1, 0.03, 14, 48),
      new window.THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.6 })
    );
    stageRing.rotation.x = Math.PI / 2;
    stageRing.position.y = 0.05;
    stageGroup.add(stageRing);

    // Nhóm gốc chứa nhân vật Mini (Scale 0.62 để bé bé mini như lúc đầu)
    rootGroup = new window.THREE.Group();
    rootGroup.scale.set(0.62, 0.62, 0.62);
    rootGroup.position.y = -0.12;
    scene.add(rootGroup);

    // =======================================================================
    // MÔ HÌNH 1: THỎ HỒNG 3D MINI (GIỐNG HỆT TẠO HÌNH MINI LÚC ĐẦU)
    // =======================================================================
    bunnyModelGroup = new window.THREE.Group();
    rootGroup.add(bunnyModelGroup);

    const bunnyPinkMat = new window.THREE.MeshStandardMaterial({
      color: 0xf8bbc4,
      roughness: 0.38,
      metalness: 0.02
    });
    const bunnyBellyMat = new window.THREE.MeshStandardMaterial({
      color: 0xfde2e6,
      roughness: 0.42
    });
    const innerEarMat = new window.THREE.MeshStandardMaterial({
      color: 0xe5909d,
      roughness: 0.42
    });
    const eyeMat = new window.THREE.MeshStandardMaterial({
      color: 0x231418,
      roughness: 0.06,
      metalness: 0.15
    });
    const whiteMat = new window.THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2
    });
    const blushMat = new window.THREE.MeshStandardMaterial({
      color: 0xf0657b,
      transparent: true,
      opacity: 0.68,
      roughness: 0.45
    });

    bBodyGroup = new window.THREE.Group();
    bunnyModelGroup.add(bBodyGroup);

    // Thân hình quả lê nhỏ nhắn mũm mĩm
    const bTorso = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(0.68, 32, 32),
      bunnyPinkMat
    );
    bTorso.scale.set(0.96, 1.06, 0.88);
    bTorso.position.y = -0.25;
    bBodyGroup.add(bTorso);

    // Bụng hồng nhạt tròn xoe
    const bBelly = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(0.46, 24, 24),
      bunnyBellyMat
    );
    bBelly.scale.set(0.92, 0.98, 0.35);
    bBelly.position.set(0, -0.24, 0.52);
    bBodyGroup.add(bBelly);

    // Đuôi bông tròn nhỏ phía sau
    const bTail = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(0.2, 18, 18),
      bunnyBellyMat
    );
    bTail.position.set(0, -0.45, -0.58);
    bBodyGroup.add(bTail);

    // Đầu Thỏ Mini to tròn phúng phính (Tỷ lệ Chibi Kawaii)
    bHeadGroup = new window.THREE.Group();
    bHeadGroup.position.set(0, 0.78, 0);
    bBodyGroup.add(bHeadGroup);

    const bHeadMesh = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(0.95, 36, 36),
      bunnyPinkMat
    );
    bHeadMesh.scale.set(1.12, 0.94, 0.98);
    bHeadGroup.add(bHeadMesh);

    // Mắt tròn đen láy + 2 đốm sáng trắng long lanh
    bLeftEye = new window.THREE.Group();
    bLeftEye.position.set(-0.36, 0.04, 0.86);
    bHeadGroup.add(bLeftEye);

    const bLeftEyeBall = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.135, 22, 22), eyeMat);
    bLeftEye.add(bLeftEyeBall);

    const bLeftShine1 = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.046, 12, 12), whiteMat);
    bLeftShine1.position.set(-0.035, 0.045, 0.115);
    bLeftEye.add(bLeftShine1);

    const bLeftShine2 = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.022, 10, 10), whiteMat);
    bLeftShine2.position.set(0.04, -0.04, 0.12);
    bLeftEye.add(bLeftShine2);

    bRightEye = new window.THREE.Group();
    bRightEye.position.set(0.36, 0.04, 0.86);
    bHeadGroup.add(bRightEye);

    const bRightEyeBall = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.135, 22, 22), eyeMat);
    bRightEye.add(bRightEyeBall);

    const bRightShine1 = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.046, 12, 12), whiteMat);
    bRightShine1.position.set(-0.035, 0.045, 0.115);
    bRightEye.add(bRightShine1);

    const bRightShine2 = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.022, 10, 10), whiteMat);
    bRightShine2.position.set(0.04, -0.04, 0.12);
    bRightEye.add(bRightShine2);

    // Má hồng phúng phính 2 bên
    const bLeftCheek = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.16, 16, 16), blushMat);
    bLeftCheek.scale.set(1.3, 0.78, 0.35);
    bLeftCheek.position.set(-0.56, -0.14, 0.8);
    bHeadGroup.add(bLeftCheek);

    const bRightCheek = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.16, 16, 16), blushMat);
    bRightCheek.scale.set(1.3, 0.78, 0.35);
    bRightCheek.position.set(0.56, -0.14, 0.8);
    bHeadGroup.add(bRightCheek);

    // Mũi hồng nhỏ & Miệng cười lộ chiếc răng thỏ trắng đáng yêu như ảnh gốc
    const bNose = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.06, 14, 14), innerEarMat);
    bNose.scale.set(1.25, 0.85, 0.8);
    bNose.position.set(0, -0.04, 0.95);
    bHeadGroup.add(bNose);

    const bMouth = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(0.13, 18, 18),
      new window.THREE.MeshStandardMaterial({ color: 0x801b2a, roughness: 0.4 })
    );
    bMouth.scale.set(1.05, 0.85, 0.35);
    bMouth.position.set(0, -0.19, 0.91);
    bHeadGroup.add(bMouth);

    // Chiếc răng thỏ trắng nhỏ xinh ở hàm trên
    const bTooth = new window.THREE.Mesh(
      new window.THREE.BoxGeometry(0.075, 0.065, 0.04),
      whiteMat
    );
    bTooth.position.set(0, -0.13, 0.95);
    bHeadGroup.add(bTooth);

    // Lưỡi hồng nhỏ bên trong miệng
    const bTongue = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(0.075, 14, 14),
      new window.THREE.MeshStandardMaterial({ color: 0xf47285, roughness: 0.35 })
    );
    bTongue.scale.set(1.1, 0.65, 0.4);
    bTongue.position.set(0, -0.23, 0.93);
    bHeadGroup.add(bTongue);

    // Tai Trái Dựng Cao & Tai Phải Hơi Cụp Điệu Đà (Giống hệt ảnh gốc!)
    bLeftEar = new window.THREE.Group();
    bLeftEar.position.set(-0.28, 0.78, -0.05);
    bLeftEar.rotation.z = -0.15;
    bHeadGroup.add(bLeftEar);

    const bLeftEarOuter = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.28, 24, 24), bunnyPinkMat);
    bLeftEarOuter.scale.set(0.62, 2.0, 0.36);
    bLeftEarOuter.position.set(0, 0.48, 0);
    bLeftEar.add(bLeftEarOuter);

    const bLeftEarInner = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.19, 20, 20), innerEarMat);
    bLeftEarInner.scale.set(0.52, 1.7, 0.25);
    bLeftEarInner.position.set(0, 0.46, 0.07);
    bLeftEar.add(bLeftEarInner);

    // Tai Phải Cụp Dễ Thương
    bRightEar = new window.THREE.Group();
    bRightEar.position.set(0.32, 0.74, -0.05);
    bRightEar.rotation.z = -0.58;
    bHeadGroup.add(bRightEar);

    const bRightEarBase = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.26, 22, 22), bunnyPinkMat);
    bRightEarBase.scale.set(0.62, 1.35, 0.36);
    bRightEarBase.position.set(0, 0.28, 0);
    bRightEar.add(bRightEarBase);

    bRightEarTip = new window.THREE.Group();
    bRightEarTip.position.set(0.08, 0.5, 0);
    bRightEarTip.rotation.z = -0.65;
    bRightEar.add(bRightEarTip);

    const bRightEarDrop = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.25, 22, 22), bunnyPinkMat);
    bRightEarDrop.scale.set(0.65, 1.25, 0.38);
    bRightEarDrop.position.set(0, 0.2, 0.04);
    bRightEarTip.add(bRightEarDrop);

    // Hai Tay Ngắn Mũm Mĩm Ôm Bó Hoa Hồng Bên Trái (Đúng tư thế ảnh gốc!)
    bLeftArm = new window.THREE.Group();
    bLeftArm.position.set(-0.52, -0.02, 0.25);
    bBodyGroup.add(bLeftArm);

    const bLeftArmMesh = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.21, 20, 20), bunnyPinkMat);
    bLeftArmMesh.scale.set(0.78, 1.45, 0.78);
    bLeftArmMesh.position.set(-0.08, -0.18, 0.12);
    bLeftArmMesh.rotation.z = 0.45;
    bLeftArmMesh.rotation.x = -0.55;
    bLeftArm.add(bLeftArmMesh);

    // Gắn bó hoa hồng vào vòng tay trái của Thỏ Mini
    const bunnyBouquet = buildMiniBouquet();
    bunnyBouquet.position.set(-0.18, -0.1, 0.36);
    bunnyBouquet.rotation.z = 0.25;
    bunnyBouquet.rotation.x = 0.35;
    bLeftArm.add(bunnyBouquet);

    bRightArm = new window.THREE.Group();
    bRightArm.position.set(0.46, -0.02, 0.32);
    bBodyGroup.add(bRightArm);

    const bRightArmMesh = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.21, 20, 20), bunnyPinkMat);
    bRightArmMesh.scale.set(0.78, 1.55, 0.78);
    bRightArmMesh.position.set(-0.18, -0.15, 0.18);
    bRightArmMesh.rotation.z = -0.85;
    bRightArmMesh.rotation.x = -0.45;
    bRightArm.add(bRightArmMesh);

    // Hai Chân Ngắn Bụ Bẫm Đang Nhún Nhảy (1 chân trụ, 1 chân đá lên vui nhộn)
    bLeftLeg = new window.THREE.Group();
    bLeftLeg.position.set(-0.26, -0.78, 0);
    bBodyGroup.add(bLeftLeg);

    const bLeftFoot = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.24, 20, 20), bunnyPinkMat);
    bLeftFoot.scale.set(0.85, 1.25, 1.1);
    bLeftFoot.position.set(0, -0.18, 0.04);
    bLeftLeg.add(bLeftFoot);

    bRightLeg = new window.THREE.Group();
    bRightLeg.position.set(0.28, -0.74, 0);
    bBodyGroup.add(bRightLeg);

    const bRightFoot = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.24, 20, 20), bunnyPinkMat);
    bRightFoot.scale.set(0.85, 1.25, 1.1);
    bRightFoot.position.set(0.06, -0.14, -0.04);
    bRightLeg.add(bRightFoot);

    // =======================================================================
    // MÔ HÌNH 2: BÚP BÊ CHIBI MINI 3D (TỶ LỆ 2 ĐẦU BÉ Xíu DỄ THƯƠNG)
    // =======================================================================
    chibiGirlModelGroup = new window.THREE.Group();
    chibiGirlModelGroup.visible = false;
    rootGroup.add(chibiGirlModelGroup);

    const chibiSkinMat = new window.THREE.MeshStandardMaterial({ color: 0xffe5d9, roughness: 0.36 });
    const chibiHairMat = new window.THREE.MeshStandardMaterial({ color: 0x4a2030, roughness: 0.3 });
    cSkirtMat = new window.THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3 });

    cBodyGroup = new window.THREE.Group();
    chibiGirlModelGroup.add(cBodyGroup);

    const cDress = new window.THREE.Mesh(
      new window.THREE.ConeGeometry(0.68, 0.95, 28),
      cSkirtMat
    );
    cDress.position.y = -0.25;
    cBodyGroup.add(cDress);

    const cCollar = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(0.32, 0.06, 12, 28),
      whiteMat
    );
    cCollar.rotation.x = Math.PI / 2;
    cCollar.position.y = 0.16;
    cBodyGroup.add(cCollar);

    cHeadGroup = new window.THREE.Group();
    cHeadGroup.position.set(0, 0.82, 0);
    cBodyGroup.add(cHeadGroup);

    const cFace = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.82, 32, 32), chibiSkinMat);
    cFace.scale.set(1.06, 0.96, 0.96);
    cHeadGroup.add(cFace);

    const cHairCap = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(0.86, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.58),
      chibiHairMat
    );
    cHairCap.position.set(0, 0.04, -0.02);
    cHeadGroup.add(cHairCap);

    // 2 Búi tóc Chibi tròn xoe trên đầu
    const cBunLeft = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.32, 20, 20), chibiHairMat);
    cBunLeft.position.set(-0.68, 0.58, -0.05);
    cHeadGroup.add(cBunLeft);

    const cBunRight = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.32, 20, 20), chibiHairMat);
    cBunRight.position.set(0.68, 0.58, -0.05);
    cHeadGroup.add(cBunRight);

    // Mắt & Má hồng Chibi
    const cEyeL = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.13, 20, 20), eyeMat);
    cEyeL.position.set(-0.32, -0.02, 0.74);
    cHeadGroup.add(cEyeL);
    const cEyeLShine = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.045, 10, 10), whiteMat);
    cEyeLShine.position.set(-0.29, 0.03, 0.85);
    cHeadGroup.add(cEyeLShine);

    const cEyeR = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.13, 20, 20), eyeMat);
    cEyeR.position.set(0.32, -0.02, 0.74);
    cHeadGroup.add(cEyeR);
    const cEyeRShine = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.045, 10, 10), whiteMat);
    cEyeRShine.position.set(0.35, 0.03, 0.85);
    cHeadGroup.add(cEyeRShine);

    const cCheekL = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.14, 14, 14), blushMat);
    cCheekL.scale.set(1.3, 0.75, 0.35);
    cCheekL.position.set(-0.5, -0.16, 0.68);
    cHeadGroup.add(cCheekL);

    const cCheekR = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.14, 14, 14), blushMat);
    cCheekR.scale.set(1.3, 0.75, 0.35);
    cCheekR.position.set(0.5, -0.16, 0.68);
    cHeadGroup.add(cCheekR);

    const cSmile = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(0.09, 0.024, 10, 20, Math.PI),
      new window.THREE.MeshStandardMaterial({ color: 0xe11d48 })
    );
    cSmile.rotation.x = Math.PI;
    cSmile.position.set(0, -0.18, 0.78);
    cHeadGroup.add(cSmile);

    cLeftArm = new window.THREE.Group();
    cLeftArm.position.set(-0.45, 0.05, 0.15);
    cBodyGroup.add(cLeftArm);
    const cArmLMesh = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.18, 16, 16), chibiSkinMat);
    cArmLMesh.scale.set(0.75, 1.4, 0.75);
    cArmLMesh.position.set(-0.1, -0.15, 0.1);
    cLeftArm.add(cArmLMesh);
    const cBouquet = buildMiniBouquet();
    cBouquet.position.set(-0.14, -0.12, 0.32);
    cLeftArm.add(cBouquet);

    cRightArm = new window.THREE.Group();
    cRightArm.position.set(0.45, 0.05, 0.15);
    cBodyGroup.add(cRightArm);
    const cArmRMesh = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.18, 16, 16), chibiSkinMat);
    cArmRMesh.scale.set(0.75, 1.4, 0.75);
    cArmRMesh.position.set(0.1, -0.15, 0.1);
    cRightArm.add(cArmRMesh);

    cLeftLeg = new window.THREE.Group();
    cLeftLeg.position.set(-0.24, -0.72, 0);
    cBodyGroup.add(cLeftLeg);
    const cFootL = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.2, 16, 16), chibiSkinMat);
    cFootL.scale.set(0.85, 1.2, 1.1);
    cFootL.position.set(0, -0.16, 0);
    cLeftLeg.add(cFootL);

    cRightLeg = new window.THREE.Group();
    cRightLeg.position.set(0.24, -0.72, 0);
    cBodyGroup.add(cRightLeg);
    const cFootR = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.2, 16, 16), chibiSkinMat);
    cFootR.scale.set(0.85, 1.2, 1.1);
    cFootR.position.set(0, -0.16, 0);
    cRightLeg.add(cFootR);

    // =======================================================================
    // TRÁI TIM 3D NHỎ XINH BAY XUNG QUANH (NHƯ TRONG ẢNH GỐC)
    // =======================================================================
    heartParticlesGroup = new window.THREE.Group();
    scene.add(heartParticlesGroup);

    const heartShape = createHeartShape();
    const heartGeo = new window.THREE.ExtrudeGeometry(heartShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035
    });
    heartGeo.center();

    for (let i = 0; i < 9; i++) {
      const hMat = new window.THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff7597 : 0xf4a2b8,
        roughness: 0.25,
        metalness: 0.1
      });
      const hMesh = new window.THREE.Mesh(heartGeo, hMat);
      hMesh.scale.set(0.2, 0.2, 0.2);
      hMesh.rotation.z = Math.PI;
      const angle = (i / 9) * Math.PI * 2;
      const radius = 1.25 + (i % 3) * 0.22;
      hMesh.userData = {
        baseAngle: angle,
        radius: radius,
        speed: 0.75 + (i % 3) * 0.2,
        yOffset: -0.65 + (i % 5) * 0.35
      };
      heartParticlesGroup.add(hMesh);
    }

    // Xoay 360 độ bằng chuột / cảm ứng
    container.addEventListener('pointerdown', (e) => {
      isDragging3D = true;
      prevPointerX = e.clientX;
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging3D) return;
      const dx = e.clientX - prevPointerX;
      prevPointerX = e.clientX;
      userRotationY += dx * 0.012;
    });
    window.addEventListener('pointerup', () => {
      isDragging3D = false;
    });

    window.addEventListener('resize', () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    function animate() {
      requestAnimationFrame(animate);
      const t = (Date.now() - clockStart) * 0.001;
      const beat = t * 4.4;

      if (jumpImpulse > 0.001) {
        jumpImpulse *= 0.88;
      } else {
        jumpImpulse = 0;
      }

      // Chớp mắt tự nhiên
      const blink = (t % 3.4 > 3.24 && t % 3.4 < 3.38) ? 0.15 : 1.0;
      if (bLeftEye && bRightEye) {
        bLeftEye.scale.y = blink;
        bRightEye.scale.y = blink;
      }

      const activeBody = activeCharacterStyle === 'chibi' ? cBodyGroup : bBodyGroup;
      const activeHead = activeCharacterStyle === 'chibi' ? cHeadGroup : bHeadGroup;
      const activeLArm = activeCharacterStyle === 'chibi' ? cLeftArm : bLeftArm;
      const activeRArm = activeCharacterStyle === 'chibi' ? cRightArm : bRightArm;
      const activeLLeg = activeCharacterStyle === 'chibi' ? cLeftLeg : bLeftLeg;
      const activeRLeg = activeCharacterStyle === 'chibi' ? cRightLeg : bRightLeg;

      if (activeBody && rootGroup) {
        if (currentDanceMode === 1) {
          // Vũ điệu 1: Nhún nhảy chân sáo dễ thương như lúc đầu
          const bounce = Math.abs(Math.sin(beat)) * 0.22 + jumpImpulse;
          activeBody.position.y = bounce;
          activeBody.position.x = 0;
          rootGroup.rotation.y = userRotationY - 0.18 + Math.sin(beat * 0.5) * 0.28;
          activeBody.rotation.z = Math.sin(beat * 0.5) * 0.08;

          activeHead.rotation.z = Math.sin(beat * 0.5) * 0.12;
          activeHead.rotation.x = Math.sin(beat) * 0.06;

          activeLArm.rotation.z = Math.sin(beat) * 0.18;
          activeRArm.rotation.z = -Math.sin(beat) * 0.22;

          activeLLeg.rotation.x = Math.sin(beat) * 0.42;
          activeRLeg.rotation.x = -Math.sin(beat) * 0.42;
          activeRLeg.rotation.z = 0.22 + Math.abs(Math.cos(beat)) * 0.2;
        } else if (currentDanceMode === 2) {
          // Vũ điệu 2: Lắc lư qua lại & vẫy tay
          activeBody.position.x = Math.sin(beat * 0.6) * 0.24;
          activeBody.position.y = Math.abs(Math.cos(beat)) * 0.16 + jumpImpulse;
          activeBody.rotation.z = -Math.sin(beat * 0.6) * 0.14;
          rootGroup.rotation.y = userRotationY + Math.cos(beat * 0.3) * 0.35;

          activeHead.rotation.z = Math.sin(beat * 0.6) * 0.18;
          activeRArm.rotation.z = -0.6 + Math.sin(beat * 1.2) * 0.35;
          activeLLeg.rotation.z = Math.sin(beat * 0.6) * 0.2;
          activeRLeg.rotation.z = Math.sin(beat * 0.6) * 0.2;
        } else if (currentDanceMode === 3) {
          // Vũ điệu 3: Bật nhảy cao tung tăng
          const highHop = Math.abs(Math.sin(beat * 1.15)) * 0.48 + jumpImpulse;
          activeBody.position.x = 0;
          activeBody.position.y = highHop;
          rootGroup.rotation.y = userRotationY + Math.sin(beat * 0.5) * 0.45;

          activeHead.rotation.x = -Math.abs(Math.sin(beat * 1.15)) * 0.15;
          activeLArm.rotation.z = 0.35 + Math.sin(beat * 1.15) * 0.3;
          activeRArm.rotation.z = -0.45 - Math.sin(beat * 1.15) * 0.3;
          activeLLeg.rotation.x = -Math.abs(Math.sin(beat * 1.15)) * 0.45;
          activeRLeg.rotation.x = Math.abs(Math.cos(beat * 1.15)) * 0.55;
        } else {
          // Vũ điệu 4: Xoay vòng 360 độ
          activeBody.position.x = 0;
          activeBody.position.y = Math.abs(Math.sin(beat)) * 0.2 + jumpImpulse;
          rootGroup.rotation.y = userRotationY + t * 2.4;
          activeHead.rotation.z = Math.sin(beat * 0.5) * 0.12;
        }

        // Tai thỏ cụp nhịp nhàng theo bước nhảy
        if (bLeftEar && bRightEar && bRightEarTip) {
          bLeftEar.rotation.z = -0.12 + Math.sin(beat) * 0.12;
          bRightEar.rotation.z = -0.55 - Math.abs(Math.sin(beat)) * 0.15;
          bRightEarTip.rotation.z = -0.62 - Math.abs(Math.cos(beat)) * 0.2;
        }
      }

      if (heartParticlesGroup) {
        heartParticlesGroup.children.forEach((h, idx) => {
          const ud = h.userData;
          const angle = ud.baseAngle + t * ud.speed;
          h.position.x = Math.cos(angle) * ud.radius;
          h.position.z = Math.sin(angle) * ud.radius;
          h.position.y = ud.yOffset + Math.sin(t * 2.4 + idx) * 0.25;
          h.rotation.y = t * 2.0 + idx;
        });
      }

      if (stageRing) {
        stageRing.scale.setScalar(1 + Math.sin(beat) * 0.035);
      }

      renderer.render(scene, camera);
    }

    animate();
    return true;
  }

  function setCharacterStyle(style) {
    activeCharacterStyle = style === 'chibi' ? 'chibi' : 'bunny';
    if (bunnyModelGroup && chibiGirlModelGroup) {
      bunnyModelGroup.visible = activeCharacterStyle === 'bunny';
      chibiGirlModelGroup.visible = activeCharacterStyle === 'chibi';
    }
    jumpImpulse = 0.35;
  }

  function setDanceMode(mode) {
    currentDanceMode = Number(mode) || 1;
    jumpImpulse = 0.35;
  }

  function setCostumeColors(bodiceHex) {
    if (cSkirtMat && bodiceHex) {
      cSkirtMat.color.setHex(bodiceHex);
    }
    jumpImpulse = 0.32;
  }

  function triggerJumpBoost() {
    jumpImpulse = 0.42;
  }

  return {
    init3DMascot,
    setCharacterStyle,
    setDanceMode,
    setCostumeColors,
    triggerJumpBoost
  };
})();
