/**
 * JSON 데이터를 로드하여 이미지 컴포넌트들을 생성하는 함수
 * @param {string} jsonPath - JSON 파일 경로
 * @returns {Promise<Array<HTMLElement>>} 생성된 이미지 엘리먼트 배열
 */
async function loadImageComponents(jsonPath = 'data/comps.json') {
    try {
        // JSON 파일 로드
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const components = await response.json();
        
        // 각 컴포넌트를 DOM 엘리먼트로 변환
        const elements = components.map(comp => createImageElement(comp));
        
        return elements;
    } catch (error) {
        console.error('이미지 컴포넌트 로드 중 오류 발생:', error);
        return [];
    }
}

/**
 * 단일 이미지 컴포넌트 데이터를 DOM 엘리먼트로 변환
 * @param {Object} comp - 컴포넌트 데이터 {id, x, y, width, height, src}
 * @returns {HTMLImageElement} 생성된 이미지 엘리먼트
 */
function createImageElement(comp) {
    const img = document.createElement('img');
    
    // 기본 속성 설정
    img.id = comp.id;
    img.src = comp.src || '';
    img.alt = `이미지 ${comp.id}`;
    
    // 위치 설정
    img.style.position = 'absolute';
    img.style.left = `${comp.x}px`;
    img.style.top = `${comp.y}px`;
    
    // 이미지가 로드된 후 실제 크기의 2배로 설정
    img.onload = function() {
        img.style.width = `${img.naturalWidth * 2}px`;
        img.style.height = `${img.naturalHeight * 2}px`;
    };
    
    // 이미지가 이미 로드된 경우 (캐시된 경우)
    if (img.complete && img.naturalWidth > 0) {
        img.style.width = `${img.naturalWidth * 2}px`;
        img.style.height = `${img.naturalHeight * 2}px`;
    }
    
    // opacity 설정 (기본값: 1, 0-1 사이의 값)
    const opacity = comp.opacity !== undefined ? comp.opacity : 1;
    if (opacity >= 0 && opacity <= 1) {
        img.style.opacity = opacity;
    }
    
    // z-index 설정 (기본값: 0)
    const zIndex = comp.zIndex !== undefined ? comp.zIndex : 0;
    img.style.zIndex = zIndex;
    
    // 기본 스타일 추가
    img.style.border = 'none';
    
    return img;
}

/**
 * 이미지들이 완전히 로드될 때까지 대기
 * @param {string|Array|NodeList|Object|HTMLImageElement} images - 대기할 이미지 집합
 * @returns {Promise<void>}
 */
async function waitForImagesLoaded(images) {
    if (!images) {
        return;
    }

    let imageList = [];

    if (typeof images === 'string') {
        imageList = Array.from(document.querySelectorAll(images));
    } else if (images instanceof HTMLImageElement) {
        imageList = [images];
    } else if (Array.isArray(images)) {
        imageList = images;
    } else if (typeof images === 'object') {
        if (typeof images.values === 'function' && images !== window) {
            imageList = Array.from(images.values());
        } else if (images.length !== undefined) {
            imageList = Array.from(images);
        } else {
            imageList = Object.values(images);
        }
    }

    if (!imageList.length) {
        return;
    }

    const loadPromises = imageList
        .filter((img) => img instanceof HTMLImageElement)
        .map((img) => {
            if (img.complete) {
                if (img.naturalWidth > 0) {
                    if (typeof img.decode === 'function') {
                        return img.decode().catch(() => {});
                    }
                    return Promise.resolve();
                }

                console.warn(`이미지 로드 실패: ${img.src}`);
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                function cleanup() {
                    img.removeEventListener('load', onLoad);
                    img.removeEventListener('error', onError);
                }

                function finish() {
                    cleanup();
                    resolve();
                }

                function onLoad() {
                    if (typeof img.decode === 'function') {
                        img.decode().catch(() => {}).finally(finish);
                    } else {
                        finish();
                    }
                }

                function onError() {
                    console.warn(`이미지 로드 실패: ${img.src}`);
                    finish();
                }

                img.addEventListener('load', onLoad, { once: true });
                img.addEventListener('error', onError, { once: true });
            });
        });

    await Promise.all(loadPromises);
}

function createLoadingOverlay(containerEl) {
    const overlay = document.createElement('div');
    overlay.className = 'image-loading-overlay';
    overlay.textContent = '로딩 중...';

    const isBody = containerEl === document.body || containerEl === document.documentElement;

    if (!isBody) {
        const computedPosition = window.getComputedStyle(containerEl).position;
        if (computedPosition === 'static' && (!containerEl.style.position || containerEl.style.position === '')) {
            containerEl.style.position = 'relative';
        }
    }

    overlay.style.position = isBody ? 'fixed' : 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0, 0, 0, 0.6)';
    overlay.style.color = '#ffffff';
    overlay.style.fontSize = '60px';
    overlay.style.fontWeight = 'bold';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'auto';
    overlay.style.cursor = 'wait';
    overlay.style.fontFamily = 'SUIT-ExtraBold';

    containerEl.appendChild(overlay);

    return overlay;
}

/**
 * 컨테이너에 이미지 컴포넌트들을 추가하고 딕셔너리 형태로 반환
 * @param {string|HTMLElement} container - 컨테이너 선택자 또는 엘리먼트
 * @param {string} jsonPath - JSON 파일 경로 (선택사항)
 * @returns {Promise<Object>} id를 키로 하고 컴포넌트 엘리먼트를 값으로 하는 딕셔너리
 */
async function renderImageComponents(container, jsonPath = 'data/comps.json') {
    let loadingOverlay = null;
    let containerEl = null;
    try {
        // JSON 파일 경로를 전역 변수에 저장 (오버레이 툴에서 사용)
        window.lastUsedJsonPath = jsonPath;
        
        containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!containerEl) {
            throw new Error('컨테이너를 찾을 수 없습니다.');
        }
        
        loadingOverlay = createLoadingOverlay(containerEl);

        const elements = await loadImageComponents(jsonPath);

        // 기존 이미지 컴포넌트 제거 (같은 클래스명을 가진 것들)
        const existingImages = containerEl.querySelectorAll('.image-component');
        existingImages.forEach(img => img.remove());
        
        // 딕셔너리 형태로 컴포넌트들을 저장
        const componentsDict = {};
        
        // 새 이미지 컴포넌트들 추가
        elements.forEach(element => {
            element.classList.add('image-component');
            containerEl.appendChild(element);
            
            // 딕셔너리에 id를 키로 하여 저장
            componentsDict[element.id] = element;
        });

        await waitForImagesLoaded(elements);
        
        // 오버레이 툴 리스너 새로고침 (개발자 모드가 활성화된 경우)
        if (window.overlayTool && window.overlayTool.isActive) {
            window.overlayTool.refreshListeners();
        }
        
        console.log(`${elements.length}개의 이미지 컴포넌트가 렌더링되었습니다.`);
        
        // 딕셔너리 형태로 반환
        return componentsDict;
        
    } catch (error) {
        console.error('이미지 컴포넌트 렌더링 중 오류 발생:', error);
        return {};
    } finally {
        if (loadingOverlay && loadingOverlay.parentNode) {
            loadingOverlay.remove();
        }
    }
}

// 전역에서 사용할 수 있도록 export
window.loadImageComponents = loadImageComponents;
window.createImageElement = createImageElement;
window.renderImageComponents = renderImageComponents;
window.waitForImagesLoaded = waitForImagesLoaded;
