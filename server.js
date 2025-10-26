const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// JSON 파일 업데이트 API
app.put('/api/update-json', async (req, res) => {
    try {
        const { jsonPath, componentId, newData } = req.body;
        const projectName = "BLIP";
        
        if (!jsonPath || !componentId || !newData) {
            return res.status(400).json({ 
                error: 'jsonPath, componentId, newData가 모두 필요합니다.' 
            });
        }

        // JSON 파일 경로 생성
        const fullPath = path.join(__dirname, projectName, jsonPath);
        
        // JSON 파일 읽기
        const jsonContent = await fs.readFile(fullPath, 'utf8');
        const jsonData = JSON.parse(jsonContent);
        
        // 해당 컴포넌트 찾기
        const componentIndex = jsonData.findIndex(comp => comp.id === componentId);
        
        if (componentIndex === -1) {
            return res.status(404).json({ 
                error: `ID가 '${componentId}'인 컴포넌트를 찾을 수 없습니다.` 
            });
        }
        
        // 컴포넌트 데이터 업데이트
        jsonData[componentIndex] = newData;
        
        // JSON 파일에 저장
        await fs.writeFile(fullPath, JSON.stringify(jsonData, null, 2), 'utf8');
        
        console.log(`JSON 파일 업데이트 완료: ${jsonPath}`);
        console.log(`업데이트된 컴포넌트:`, newData);
        
        res.json({ 
            success: true, 
            message: 'JSON 파일이 성공적으로 업데이트되었습니다.',
            updatedComponent: newData
        });
        
    } catch (error) {
        console.error('JSON 파일 업데이트 오류:', error);
        res.status(500).json({ 
            error: 'JSON 파일 업데이트 중 오류가 발생했습니다.',
            error: error.message 
        });
    }
});

// JSON 파일 전체 가져오기 API
app.get('/api/json/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const jsonPath = path.join(__dirname, projectName, 'data', filename);
        
        const jsonContent = await fs.readFile(jsonPath, 'utf8');
        const jsonData = JSON.parse(jsonContent);
        
        res.json(jsonData);
    } catch (error) {
        console.error('JSON 파일 읽기 오류:', error);
        res.status(500).json({ 
            error: 'JSON 파일을 읽는 중 오류가 발생했습니다.',
            error: error.message 
        });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`📁 정적 파일 서빙: http://localhost:${PORT}`);
    console.log(`🔧 JSON API: http://localhost:${PORT}/api/update-json`);
});
