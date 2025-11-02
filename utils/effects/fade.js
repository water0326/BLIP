/**
 * 페이드인아웃 효과를 위한 유틸리티 함수들
 */

/**
 * 요소에 페이드인 효과를 적용
 * @param {HTMLElement} element - 페이드인할 요소
 * @param {number} duration - 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {string} easing - 이징 함수 (기본값: 'ease-in-out')
 * @param {Function} callback - 애니메이션 완료 후 실행할 콜백 함수
 * @returns {Promise} 애니메이션 완료 시 resolve되는 Promise
 */
function fadeIn(element, duration = 500, easing = 'ease-in-out', callback = null) {
    return new Promise((resolve) => {
        if (!element) {
            console.warn('fadeIn: 요소가 존재하지 않습니다.');
            resolve();
            return;
        }

        // display가 none인 경우 먼저 block으로 설정하고 레이아웃 계산 대기
        if (element.style.display === 'none' || getComputedStyle(element).display === 'none') {
            element.style.display = 'block';
            element.style.opacity = '0';
            element.style.transition = 'none';
            
            // 레이아웃 계산을 위한 강제 리플로우
            element.offsetHeight;
            
            // 다음 프레임에서 애니메이션 시작
            requestAnimationFrame(() => {
                element.style.transition = `opacity ${duration}ms ${easing}`;
                element.style.opacity = '1';
            });
        } else {
            // 이미 보이는 상태라면 일반적인 페이드인
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ${easing}`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        }

        // 애니메이션 완료 시 resolve 및 콜백 실행
        setTimeout(() => {
            if (callback && typeof callback === 'function') {
                callback();
            }
            resolve();
        }, duration);
    });
}

/**
 * 요소에 페이드아웃 효과를 적용
 * @param {HTMLElement} element - 페이드아웃할 요소
 * @param {number} duration - 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {string} easing - 이징 함수 (기본값: 'ease-in-out')
 * @param {Function} callback - 애니메이션 완료 후 실행할 콜백 함수
 * @returns {Promise} 애니메이션 완료 시 resolve되는 Promise
 */
function fadeOut(element, duration = 500, easing = 'ease-in-out', callback = null) {
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

        // 애니메이션 완료 후 display none으로 설정 및 콜백 실행
        setTimeout(() => {
            element.style.display = 'none';
            if (callback && typeof callback === 'function') {
                callback();
            }
            resolve();
        }, duration);
    });
}

/**
 * 요소에 페이드토글 효과를 적용 (페이드인/아웃 자동 전환)
 * @param {HTMLElement} element - 토글할 요소
 * @param {number} duration - 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {string} easing - 이징 함수 (기본값: 'ease-in-out')
 * @param {Function} callback - 애니메이션 완료 후 실행할 콜백 함수
 * @returns {Promise} 애니메이션 완료 시 resolve되는 Promise
 */
function fadeToggle(element, duration = 500, easing = 'ease-in-out', callback = null) {
    if (!element) {
        console.warn('fadeToggle: 요소가 존재하지 않습니다.');
        return Promise.resolve();
    }

    const isVisible = element.style.opacity !== '0' && 
                     element.style.display !== 'none' && 
                     getComputedStyle(element).opacity !== '0';

    if (isVisible) {
        return fadeOut(element, duration, easing, callback);
    } else {
        return fadeIn(element, duration, easing, callback);
    }
}

/**
 * 여러 요소에 순차적으로 페이드인 효과 적용
 * @param {HTMLElement[]} elements - 페이드인할 요소 배열
 * @param {number} duration - 각 요소의 애니메이션 지속시간 (밀리초, 기본값: 500)
 * @param {number} delay - 요소 간 지연시간 (밀리초, 기본값: 100)
 * @param {Function} callback - 모든 애니메이션 완료 후 실행할 콜백 함수
 * @returns {Promise} 모든 애니메이션 완료 시 resolve되는 Promise
 */
function fadeInSequence(elements, duration = 500, delay = 100, callback = null) {
    return new Promise((resolve) => {
        if (!elements || elements.length === 0) {
            if (callback && typeof callback === 'function') {
                callback();
            }
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
                        if (callback && typeof callback === 'function') {
                            callback();
                        }
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
 * @param {Function} callback - 모든 애니메이션 완료 후 실행할 콜백 함수
 * @returns {Promise} 모든 애니메이션 완료 시 resolve되는 Promise
 */
function fadeOutSequence(elements, duration = 500, delay = 100, callback = null) {
    return new Promise((resolve) => {
        if (!elements || elements.length === 0) {
            if (callback && typeof callback === 'function') {
                callback();
            }
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
                        if (callback && typeof callback === 'function') {
                            callback();
                        }
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
 * @param {Function} callback - 애니메이션 완료 후 실행할 콜백 함수
 */
function fade(selector, action = 'toggle', duration = 500, callback = null) {
    const element = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;

    if (!element) {
        console.warn(`fade: 요소를 찾을 수 없습니다. (${selector})`);
        return;
    }

    switch (action.toLowerCase()) {
        case 'in':
            return fadeIn(element, duration, 'ease-in-out', callback);
        case 'out':
            return fadeOut(element, duration, 'ease-in-out', callback);
        case 'toggle':
            return fadeToggle(element, duration, 'ease-in-out', callback);
        default:
            console.warn(`fade: 알 수 없는 액션입니다. (${action})`);
    }
}

/**
 * 시퀀스 실행을 위한 헬퍼 함수들
 */

/**
 * 시퀀스 단계에서 오디오를 재생하고 완료를 추적
 * @param {string} audioName - static/audio 하위의 파일명
 * @returns {Promise|null} 오디오 종료를 기다리는 Promise (생성 실패 시 null)
 */
function playSequenceAudio(audioName) {
    if (!audioName) {
        return null;
    }

    try {
        const audioUrl = new URL(`../static/audio/${audioName}`, window.location.href);
        const audio = new Audio(audioUrl.href);

        const waitPromise = new Promise((resolve) => {
            let finished = false;

            function cleanup() {
                if (finished) {
                    return;
                }
                finished = true;
                audio.removeEventListener('ended', onEnded);
                audio.removeEventListener('error', onError);
                resolve();
            }

            function onEnded() {
                cleanup();
            }

            function onError(event) {
                console.warn(`runSequence: 오디오 재생 중 오류가 발생했습니다. (${audioName})`, event && event.error ? event.error : event);
                cleanup();
            }

            audio.addEventListener('ended', onEnded, { once: true });
            audio.addEventListener('error', onError, { once: true });

            const playResult = audio.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch((error) => {
                    console.warn(`runSequence: 오디오를 재생할 수 없습니다. (${audioName})`, error);
                    cleanup();
                });
            }
        });

        return waitPromise;
    } catch (error) {
        console.warn(`runSequence: 오디오 경로를 생성할 수 없습니다. (${audioName})`, error);
        return null;
    }
}

/**
 * 여러 애니메이션을 순차적으로 실행
 * @param {Array} sequence - 실행할 애니메이션 배열 [{action, selector, duration, delay, callback, audio_name, audio_sequence}, ...]
 * @returns {Promise} 모든 애니메이션 완료 시 resolve되는 Promise
 */
async function runSequence(sequence) {
    for (const step of sequence) {
        const { action, selector, duration = 500, delay = 0, callback = null, audio_name = null, audio_sequence = false } = step;
        
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const audioPromise = audio_name ? playSequenceAudio(audio_name) : null;

        await fade(selector, action, duration);
        
        // 각 단계 완료 후 callback 실행
        if (callback && typeof callback === 'function') {
            callback();
        }

        if (audio_sequence && audioPromise) {
            await audioPromise;
        }
    }
}

/**
 * 여러 애니메이션을 병렬로 실행
 * @param {Array} parallel - 실행할 애니메이션 배열 [{action, selector, duration, delay}, ...]
 * @returns {Promise} 모든 애니메이션 완료 시 resolve되는 Promise
 */
async function runParallel(parallel) {
    const promises = parallel.map(step => {
        const { action, selector, duration = 500, delay = 0 } = step;
        
        return new Promise(resolve => {
            setTimeout(async () => {
                await fade(selector, action, duration);
                resolve();
            }, delay);
        });
    });
    
    await Promise.all(promises);
}

/**
 * 반복 애니메이션 실행
 * @param {string|HTMLElement} selector - CSS 선택자 또는 DOM 요소
 * @param {string} action - 'in', 'out', 'toggle' 중 하나
 * @param {number} duration - 애니메이션 지속시간 (밀리초)
 * @param {number} interval - 반복 간격 (밀리초)
 * @param {number} count - 반복 횟수
 * @returns {Promise} 모든 반복 완료 시 resolve되는 Promise
 */
async function repeatAnimation(selector, action, duration = 500, interval = 1000, count = 1) {
    for (let i = 0; i < count; i++) {
        await fade(selector, action, duration);
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
}

// 전역에서 사용할 수 있도록 export
window.fadeIn = fadeIn;
window.fadeOut = fadeOut;
window.fadeToggle = fadeToggle;
window.fadeInSequence = fadeInSequence;
window.fadeOutSequence = fadeOutSequence;
window.fade = fade;
window.runSequence = runSequence;
window.runParallel = runParallel;
window.repeatAnimation = repeatAnimation;
