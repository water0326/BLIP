/**
 * 컴포넌트 오버레이 편집 툴
 * 개발자 모드에서 컴포넌트를 클릭하여 속성을 실시간으로 수정할 수 있는 툴
 */

class OverlayTool {
    constructor() {
        this.isActive = false;
        this.currentComponent = null;
        this.originalData = null;
        this.init();
    }

    /**
     * 오버레이 툴 초기화
     */
    init() {
        this.createToggleButton();
        this.createOverlayPanel();
        this.bindEvents();
    }

    /**
     * 개발자 모드 토글 버튼 생성
     */
    createToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'dev-toggle';
        toggleBtn.className = 'dev-toggle';
        toggleBtn.textContent = '개발자 모드';
        document.body.appendChild(toggleBtn);
    }

    /**
     * 오버레이 패널 생성
     */
    createOverlayPanel() {
        const overlay = document.createElement('div');
        overlay.id = 'overlay-tool';
        overlay.className = 'overlay-tool';
        
        overlay.innerHTML = `
            <div class="overlay-panel">
                <div class="overlay-header">
                    <h3 class="overlay-title">컴포넌트 편집</h3>
                    <button class="overlay-close" id="overlay-close">×</button>
                </div>
                <form class="overlay-form" id="overlay-form">
                    <div class="form-group">
                        <label class="form-label" for="comp-id">ID</label>
                        <input type="text" id="comp-id" class="form-input" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="comp-src">이미지 경로</label>
                        <input type="text" id="comp-src" class="form-input">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="comp-x">X 좌표</label>
                            <input type="number" id="comp-x" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="comp-y">Y 좌표</label>
                            <input type="number" id="comp-y" class="form-input">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="comp-width">너비</label>
                            <input type="number" id="comp-width" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="comp-height">높이</label>
                            <input type="number" id="comp-height" class="form-input">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="comp-zindex">Z-Index</label>
                            <input type="number" id="comp-zindex" class="form-input" placeholder="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="comp-opacity">투명도</label>
                            <input type="number" id="comp-opacity" class="form-input" min="0" max="1" step="0.1" placeholder="1.0">
                        </div>
                    </div>
                    <div class="overlay-buttons">
                        <button type="button" class="btn btn-primary" id="save-changes">저장</button>
                        <button type="button" class="btn btn-secondary" id="cancel-changes">취소</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 개발자 모드 토글
        document.getElementById('dev-toggle').addEventListener('click', () => {
            this.toggleDevMode();
        });

        // 오버레이 닫기
        document.getElementById('overlay-close').addEventListener('click', () => {
            this.closeOverlay();
        });

        // 취소 버튼
        document.getElementById('cancel-changes').addEventListener('click', () => {
            this.closeOverlay();
        });

        // 저장 버튼
        document.getElementById('save-changes').addEventListener('click', () => {
            this.saveChanges();
        });

        // src 입력 필드 실시간 검증
        document.getElementById('comp-src').addEventListener('input', (e) => {
            this.validateSrcInput(e.target);
        });

        // 오버레이 배경 클릭 시 닫기
        document.getElementById('overlay-tool').addEventListener('click', (e) => {
            if (e.target.id === 'overlay-tool') {
                this.closeOverlay();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.closeOverlay();
            }
        });
    }

    /**
     * 개발자 모드 토글
     */
    toggleDevMode() {
        this.isActive = !this.isActive;
        const toggleBtn = document.getElementById('dev-toggle');
        const body = document.body;
        
        if (this.isActive) {
            toggleBtn.textContent = '개발자 모드 종료';
            toggleBtn.classList.add('active');
            body.classList.add('dev-mode');
            this.addComponentClickListeners();
        } else {
            toggleBtn.textContent = '개발자 모드';
            toggleBtn.classList.remove('active');
            body.classList.remove('dev-mode');
            this.removeComponentClickListeners();
            this.closeOverlay();
        }
    }

    /**
     * 컴포넌트 클릭 리스너 추가
     */
    addComponentClickListeners() {
        const components = document.querySelectorAll('.image-component');
        components.forEach(component => {
            component.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openOverlay(component);
            });
        });
    }

    /**
     * 컴포넌트 클릭 리스너 제거
     */
    removeComponentClickListeners() {
        const components = document.querySelectorAll('.image-component');
        components.forEach(component => {
            component.removeEventListener('click', this.openOverlay);
        });
    }

    /**
     * 오버레이 열기
     */
    openOverlay(component) {
        this.currentComponent = component;
        this.originalData = this.getComponentData(component);
        
        // src를 상대 경로로 변환
        const relativeSrc = this.convertToRelativePath(component.src);
        
        // 폼에 현재 값들 채우기
        document.getElementById('comp-id').value = component.id;
        document.getElementById('comp-src').value = relativeSrc;
        document.getElementById('comp-x').value = parseInt(component.style.left) || 0;
        document.getElementById('comp-y').value = parseInt(component.style.top) || 0;
        document.getElementById('comp-width').value = parseInt(component.style.width) || 0;
        document.getElementById('comp-height').value = parseInt(component.style.height) || 0;
        document.getElementById('comp-zindex').value = parseInt(component.style.zIndex) || 0;
        document.getElementById('comp-opacity').value = parseFloat(component.style.opacity) || 1.0;
        
        // 오버레이 표시
        document.getElementById('overlay-tool').classList.add('active');
    }

    /**
     * 오버레이 닫기
     */
    closeOverlay() {
        document.getElementById('overlay-tool').classList.remove('active');
        this.currentComponent = null;
        this.originalData = null;
    }

    /**
     * 컴포넌트 데이터 가져오기
     */
    getComponentData(component) {
        return {
            id: component.id,
            src: component.src,
            x: parseInt(component.style.left) || 0,
            y: parseInt(component.style.top) || 0,
            width: parseInt(component.style.width) || 0,
            height: parseInt(component.style.height) || 0,
            zIndex: parseInt(component.style.zIndex) || 0,
            opacity: parseFloat(component.style.opacity) || 1.0
        };
    }

    /**
     * 변경사항 저장
     */
    async saveChanges() {
        if (!this.currentComponent) return;

        // 폼에서 값들 가져오기
        const srcValue = document.getElementById('comp-src').value;
        
        // src가 절대 URL인지 확인
        if (srcValue && (srcValue.startsWith('http://') || srcValue.startsWith('https://') || srcValue.startsWith('//'))) {
            alert('이미지 경로는 상대 경로만 사용할 수 있습니다.\n예: ../static/img/main/image.png');
            return;
        }

        const newData = {
            id: document.getElementById('comp-id').value,
            src: srcValue,
            x: parseInt(document.getElementById('comp-x').value) || 0,
            y: parseInt(document.getElementById('comp-y').value) || 0,
            width: parseInt(document.getElementById('comp-width').value) || 0,
            height: parseInt(document.getElementById('comp-height').value) || 0,
            zIndex: parseInt(document.getElementById('comp-zindex').value) || 0,
            opacity: parseFloat(document.getElementById('comp-opacity').value) || 1.0
        };

        // 컴포넌트 스타일 업데이트
        this.currentComponent.id = newData.id;
        this.currentComponent.src = newData.src;
        this.currentComponent.style.left = `${newData.x}px`;
        this.currentComponent.style.top = `${newData.y}px`;
        
        if (newData.width > 0) {
            this.currentComponent.style.width = `${newData.width}px`;
        } else {
            this.currentComponent.style.width = '';
        }
        
        if (newData.height > 0) {
            this.currentComponent.style.height = `${newData.height}px`;
        } else {
            this.currentComponent.style.height = '';
        }

        // zIndex 설정
        if (newData.zIndex !== 0) {
            this.currentComponent.style.zIndex = newData.zIndex;
        } else {
            this.currentComponent.style.zIndex = '';
        }

        // opacity 설정
        if (newData.opacity !== 1.0) {
            this.currentComponent.style.opacity = newData.opacity;
        } else {
            this.currentComponent.style.opacity = '';
        }

        // JSON 파일 업데이트
        await this.updateJsonFile(newData);

        console.log('컴포넌트 업데이트:', newData);
        this.closeOverlay();
    }

    /**
     * JSON 파일 업데이트
     */
    async updateJsonFile(updatedData) {
        try {
            // 현재 JSON 파일 경로 가져오기 (렌더링된 JSON 파일 경로)
            const currentJsonPath = this.getCurrentJsonPath();
            if (!currentJsonPath) {
                console.warn('JSON 파일 경로를 찾을 수 없습니다.');
                return;
            }

            // 현재 JSON 데이터 로드
            const response = await fetch(currentJsonPath);
            if (!response.ok) {
                throw new Error(`JSON 파일 로드 실패: ${response.status}`);
            }
            const jsonData = await response.json();

            // 해당 컴포넌트 찾아서 업데이트
            const componentIndex = jsonData.findIndex(comp => comp.id === this.originalData.id);
            if (componentIndex !== -1) {
                // 서버에 개별 컴포넌트 데이터만 전달
                await this.saveJsonToServer(currentJsonPath, updatedData);
                console.log('JSON 파일이 업데이트되었습니다.');
            } else {
                console.warn('업데이트할 컴포넌트를 JSON에서 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('JSON 파일 업데이트 중 오류:', error);
            alert('JSON 파일 업데이트에 실패했습니다. 화면 변경사항은 저장되었습니다.');
        }
    }

    /**
     * 현재 사용 중인 JSON 파일 경로 가져오기
     */
    getCurrentJsonPath() {
        // 현재 페이지에서 사용된 JSON 파일 경로를 추적
        if (window.lastUsedJsonPath) {
            return window.lastUsedJsonPath;
        }
        
        // 기본값으로 main_comps.json 사용
        const currentPath = window.location.pathname;
        if (currentPath.includes('main.html')) {
            return '../data/main_comps.json';
        }
        
        return null;
    }

    /**
     * 서버에 JSON 파일 저장
     */
    async saveJsonToServer(jsonPath, newData) {
        try {
            // 서버 API를 통해 JSON 파일 직접 업데이트
            const response = await fetch('/api/update-json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonPath: jsonPath,
                    componentId: this.originalData.id,
                    newData: newData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '서버 응답 오류');
            }

            const result = await response.json();
            console.log('✅ JSON 파일이 서버에서 직접 업데이트되었습니다:', result.message);
            
        } catch (error) {
            console.error('서버 API 호출 실패, 대체 방법 사용:', error);
            
            // 서버 API 실패 시 기존 다운로드 방식 사용
            const jsonString = JSON.stringify(newData, null, 2);
            this.downloadJsonFile(jsonString, jsonPath);
            console.log('업데이트된 JSON 데이터 (수동 저장 필요):');
            console.log(jsonString);
        }
    }

    /**
     * JSON 파일 다운로드
     */
    downloadJsonFile(jsonString, filename) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.split('/').pop(); // 파일명만 추출
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 절대 URL을 상대 경로로 변환
     */
    convertToRelativePath(src) {
        if (!src) return '';
        
        // 이미 상대 경로인 경우 그대로 반환
        if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
            return src;
        }
        
        try {
            const url = new URL(src);
            const pathname = url.pathname;
            
            // 서버 루트에서 시작하는 경로를 상대 경로로 변환
            if (pathname.startsWith('/')) {
                // 현재 페이지가 pages/ 폴더에 있으므로 ../ 를 추가
                return '..' + pathname;
            }
            
            return pathname;
        } catch (error) {
            console.warn('URL 변환 실패:', error);
            return src;
        }
    }

    /**
     * src 입력 필드 실시간 검증
     */
    validateSrcInput(input) {
        const value = input.value;
        
        // 절대 URL 감지
        if (value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//'))) {
            input.style.borderColor = '#ff4757';
            input.style.backgroundColor = '#ffe6e6';
            
            // 툴팁 표시
            this.showTooltip(input, '상대 경로만 사용하세요 (예: ../static/img/main/image.png)');
        } else {
            input.style.borderColor = '#ddd';
            input.style.backgroundColor = 'white';
            this.hideTooltip();
        }
    }

    /**
     * 툴팁 표시
     */
    showTooltip(element, message) {
        this.hideTooltip(); // 기존 툴팁 제거
        
        const tooltip = document.createElement('div');
        tooltip.id = 'src-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10001;
            pointer-events: none;
            max-width: 300px;
        `;
        tooltip.textContent = message;
        
        document.body.appendChild(tooltip);
        
        // 툴팁 위치 설정
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
    }

    /**
     * 툴팁 숨기기
     */
    hideTooltip() {
        const tooltip = document.getElementById('src-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * 새로운 컴포넌트가 추가될 때 클릭 리스너 재등록
     */
    refreshListeners() {
        if (this.isActive) {
            this.removeComponentClickListeners();
            this.addComponentClickListeners();
        }
    }
}

// 전역 인스턴스 생성
window.overlayTool = new OverlayTool();

// 전역에서 사용할 수 있도록 export
window.OverlayTool = OverlayTool;
