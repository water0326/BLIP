/**
 * 페이드인아웃 효과를 위한 유틸리티 함수들
 */

/**
 * 요소에 페이드인 효과를 적용
 * @param {HTMLElement} element - 페이드인할 요소
 * @param {number} duration - 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {string} easing - 이징 함수 (기본값: 'ease-in-out')
 * @returns {Promise} 애니메이션 완료 시 resolve되는 Promise
 */
function fadeIn(element, duration = 500, easing = 'ease-in-out') {
    return new Promise((resolve) => {
        if (!element) {
            console.warn('fadeIn: 요소가 존재하지 않습니다.');
            resolve();
            return;
        }

        // 초기 상태 설정
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ${easing}`;

        // 다음 프레임에서 애니메이션 시작
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });

        // 애니메이션 완료 시 resolve
        setTimeout(() => {
            resolve();
        }, duration);
    });
}

/**
 * 요소에 페이드아웃 효과를 적용
 * @param {HTMLElement} element - 페이드아웃할 요소
 * @param {number} duration - 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {string} easing - 이징 함수 (기본값: 'ease-in-out')
 * @returns {Promise} 애니메이션 완료 시 resolve되는 Promise
 */
function fadeOut(element, duration = 500, easing = 'ease-in-out') {
    return new Promise((resolve) => {
        if (!element) {
            console.warn('fadeOut: 요소가 존재하지 않습니다.');
            resolve();
            return;
        }

        // 초기 상태 설정
        element.style.opacity = '1';
        element.style.transition = `opacity ${duration}ms ${easing}`;

        // 다음 프레임에서 애니메이션 시작
        requestAnimationFrame(() => {
            element.style.opacity = '0';
        });

        // 애니메이션 완료 후 display none으로 설정
        setTimeout(() => {
            element.style.display = 'none';
            resolve();
        }, duration);
    });
}

/**
 * 요소에 페이드토글 효과를 적용 (페이드인/아웃 자동 전환)
 * @param {HTMLElement} element - 토글할 요소
 * @param {number} duration - 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {string} easing - 이징 함수 (기본값: 'ease-in-out')
 * @returns {Promise} 애니메이션 완료 시 resolve되는 Promise
 */
function fadeToggle(element, duration = 500, easing = 'ease-in-out') {
    if (!element) {
        console.warn('fadeToggle: 요소가 존재하지 않습니다.');
        return Promise.resolve();
    }

    const isVisible = element.style.opacity !== '0' && 
                     element.style.display !== 'none' && 
                     getComputedStyle(element).opacity !== '0';

    if (isVisible) {
        return fadeOut(element, duration, easing);
    } else {
        return fadeIn(element, duration, easing);
    }
}

/**
 * 여러 요소에 순차적으로 페이드인 효과 적용
 * @param {HTMLElement[]} elements - 페이드인할 요소 배열
 * @param {number} duration - 각 요소의 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {number} delay - 요소 간 지연시간 (밀리초, 기본값: 100)
 * @returns {Promise} 모든 애니메이션 완료 시 resolve되는 Promise
 */
function fadeInSequence(elements, duration = 500, delay = 100) {
    return new Promise((resolve) => {
        if (!elements || elements.length === 0) {
            resolve();
            return;
        }

        let completed = 0;
        const total = elements.length;

        elements.forEach((element, index) => {
            setTimeout(() => {
                fadeIn(element, duration).then(() => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                });
            }, index * delay);
        });
    });
}

/**
 * 여러 요소에 순차적으로 페이드아웃 효과 적용
 * @param {HTMLElement[]} elements - 페이드아웃할 요소 배열
 * @param {number} duration - 각 요소의 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {number} delay - 요소 간 지연시간 (밀리초, 기본값: 100)
 * @returns {Promise} 모든 애니메이션 완료 시 resolve되는 Promise
 */
function fadeOutSequence(elements, duration = 500, delay = 100) {
    return new Promise((resolve) => {
        if (!elements || elements.length === 0) {
            resolve();
            return;
        }

        let completed = 0;
        const total = elements.length;

        elements.forEach((element, index) => {
            setTimeout(() => {
                fadeOut(element, duration).then(() => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                });
            }, index * delay);
        });
    });
}

/**
 * 간단한 페이드인아웃 실행 함수 (전역에서 쉽게 사용)
 * @param {string|HTMLElement} selector - CSS 선택자 또는 DOM 요소
 * @param {string} action - 'in', 'out', 'toggle' 중 하나
 * @param {number} duration - 애니메이션 지속시간 (밀리초, 기본값: 500)
 */
function fade(selector, action = 'toggle', duration = 500) {
    const element = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;

    if (!element) {
        console.warn(`fade: 요소를 찾을 수 없습니다. (${selector})`);
        return;
    }

    switch (action.toLowerCase()) {
        case 'in':
            return fadeIn(element, duration);
        case 'out':
            return fadeOut(element, duration);
        case 'toggle':
            return fadeToggle(element, duration);
        default:
            console.warn(`fade: 알 수 없는 액션입니다. (${action})`);
    }
}

// 전역에서 사용할 수 있도록 export
window.fadeIn = fadeIn;
window.fadeOut = fadeOut;
window.fadeToggle = fadeToggle;
window.fadeInSequence = fadeInSequence;
window.fadeOutSequence = fadeOutSequence;
window.fade = fade;
