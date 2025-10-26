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
    
    // 위치 및 크기 설정
    img.style.position = 'absolute';
    img.style.left = `${comp.x}px`;
    img.style.top = `${comp.y}px`;
    if(comp.width > 0) {
        img.style.width = `${comp.width}px`;
    }
    if(comp.height > 0) {
        img.style.height = `${comp.height}px`;
    }
    
    // 기본 스타일 추가
    img.style.border = 'none';
    
    return img;
}

/**
 * 컨테이너에 이미지 컴포넌트들을 추가하고 딕셔너리 형태로 반환
 * @param {string|HTMLElement} container - 컨테이너 선택자 또는 엘리먼트
 * @param {string} jsonPath - JSON 파일 경로 (선택사항)
 * @returns {Promise<Object>} id를 키로 하고 컴포넌트 엘리먼트를 값으로 하는 딕셔너리
 */
async function renderImageComponents(container, jsonPath = 'data/comps.json') {
    try {
        // JSON 파일 경로를 전역 변수에 저장 (오버레이 툴에서 사용)
        window.lastUsedJsonPath = jsonPath;
        
        const elements = await loadImageComponents(jsonPath);
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!containerEl) {
            throw new Error('컨테이너를 찾을 수 없습니다.');
        }
        
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
    }
}

// 전역에서 사용할 수 있도록 export
window.loadImageComponents = loadImageComponents;
window.createImageElement = createImageElement;
window.renderImageComponents = renderImageComponents;
