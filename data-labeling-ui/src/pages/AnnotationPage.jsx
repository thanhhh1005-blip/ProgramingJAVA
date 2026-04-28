import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getErrorMessage, getToken, parseApiResponse, unwrapResult } from '../lib/api';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 550;
const DEFAULT_LABELS = [
    { id: 1, name: 'Car', color: '#22c55e' },
    { id: 2, name: 'Motorbike', color: '#3b82f6' },
    { id: 3, name: 'Pedestrian', color: '#f97316' },
    { id: 4, name: 'Truck', color: '#ef4444' },
];

function normalizeLabels(rawLabels) {
    if (!Array.isArray(rawLabels)) {
        return [];
    }

    return rawLabels
        .map((label, index) => {
            const id = Number(label?.id ?? index + 1);
            const name = String(label?.name ?? '').trim();
            const color = label?.color || DEFAULT_LABELS[index % DEFAULT_LABELS.length].color;

            if (!name || Number.isNaN(id)) {
                return null;
            }

            return { id, name, color };
        })
        .filter(Boolean);
}

const AnnotationPage = () => {
    const canvasRef = useRef(null);
    const [searchParams] = useSearchParams();

    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [boxes, setBoxes] = useState([]);
    const [currentBox, setCurrentBox] = useState(null);
    const [selectedLabelId, setSelectedLabelId] = useState(DEFAULT_LABELS[0].id);
    const [availableLabels, setAvailableLabels] = useState(DEFAULT_LABELS);
    const [task, setTask] = useState(null);

    const projectIdQuery = searchParams.get('projectId');
    const projectId = projectIdQuery && !Number.isNaN(Number(projectIdQuery))
        ? Number(projectIdQuery)
        : null;

    useEffect(() => {
        if (!projectId) {
            setAvailableLabels(DEFAULT_LABELS);
            setSelectedLabelId(DEFAULT_LABELS[0].id);
            return;
        }

        try {
            const storedLabels = localStorage.getItem(`label-project-labels:${projectId}`);
            const parsedLabels = normalizeLabels(storedLabels ? JSON.parse(storedLabels) : []);

            if (parsedLabels.length > 0) {
                setAvailableLabels(parsedLabels);
                setSelectedLabelId((currentSelected) => (
                    parsedLabels.some((label) => label.id === currentSelected)
                        ? currentSelected
                        : parsedLabels[0].id
                ));
                return;
            }
        } catch (error) {
            console.error('Lỗi đọc bộ nhãn của dự án:', error);
        }

        setAvailableLabels(DEFAULT_LABELS);
        setSelectedLabelId(DEFAULT_LABELS[0].id);
    }, [projectId]);

    const loadNextTask = useCallback(async () => {
        setIsLoading(true);
        try {
            const query = projectId ? `?projectId=${projectId}` : '';
            const response = await fetch(`${API_BASE_URL}/annotations/tasks/next${query}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            const payload = await parseApiResponse(response);
            const result = unwrapResult(payload);

            if (response.ok && result?.taskId) {
                setTask(result);
                setBoxes([]);
                setCurrentBox(null);
            } else {
                setTask(null);
                setBoxes([]);
            }
        } catch (error) {
            console.error('Lỗi tải task annotation:', error);
            setTask(null);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadNextTask();
    }, [loadNextTask]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = task?.fileUrl || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800';

        img.onload = () => {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            boxes.forEach((box) => {
                const drawX = Math.min(box.x, box.x + box.width);
                const drawY = Math.min(box.y, box.y + box.height);
                const drawW = Math.abs(box.width);
                const drawH = Math.abs(box.height);
                const label = availableLabels.find((item) => item.id === box.labelId);

                ctx.strokeStyle = label?.color || '#00ff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(drawX, drawY, drawW, drawH);

                ctx.fillStyle = label?.color || '#00ff00';
                ctx.font = '16px Arial';
                const labelText = label?.name ?? `Label-${box.labelId}`;
                ctx.fillText(labelText, drawX, Math.max(14, drawY - 5));
            });

            if (currentBox) {
                const drawX = Math.min(currentBox.x, currentBox.x + currentBox.width);
                const drawY = Math.min(currentBox.y, currentBox.y + currentBox.height);
                const drawW = Math.abs(currentBox.width);
                const drawH = Math.abs(currentBox.height);

                ctx.strokeStyle = '#ff0000';
                ctx.setLineDash([5]);
                ctx.strokeRect(drawX, drawY, drawW, drawH);
                ctx.setLineDash([]);
            }
        };
    }, [availableLabels, boxes, currentBox, task]);

    const handleMouseDown = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setStartPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        setIsDrawing(true);
    };

    const handleMouseMove = (event) => {
        if (!isDrawing) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        setCurrentBox({
            x: startPos.x,
            y: startPos.y,
            width: (event.clientX - rect.left) - startPos.x,
            height: (event.clientY - rect.top) - startPos.y,
            labelId: selectedLabelId,
        });
    };

    const handleMouseUp = () => {
        if (currentBox && Math.abs(currentBox.width) > 5 && Math.abs(currentBox.height) > 5) {
            setBoxes((prev) => [...prev, currentBox]);
        }
        setIsDrawing(false);
        setCurrentBox(null);
    };

    const handleSave = async () => {
        const token = getToken();

        if (!token) {
            alert('Lỗi: Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.');
            return;
        }
        if (!task?.taskId) {
            alert('Hiện không có task để lưu.');
            return;
        }
        if (boxes.length === 0) {
            alert('Vui lòng vẽ ít nhất 1 bounding box trước khi lưu.');
            return;
        }

        const requestBody = {
            taskId: task.taskId,
            annotations: boxes.map((box) => {
                const x = Math.min(box.x, box.x + box.width);
                const y = Math.min(box.y, box.y + box.height);
                const width = Math.abs(box.width);
                const height = Math.abs(box.height);

                return {
                    labelId: box.labelId,
                    xcenter: (x + width / 2) / CANVAS_WIDTH,
                    ycenter: (y + height / 2) / CANVAS_HEIGHT,
                    width: width / CANVAS_WIDTH,
                    height: height / CANVAS_HEIGHT,
                };
            }),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/annotations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const payload = await parseApiResponse(response);
            if (!response.ok) {
                alert(`Lỗi từ hệ thống: ${getErrorMessage(payload, 'Không lưu được dữ liệu.')}`);
                return;
            }

            alert('Lưu dữ liệu gán nhãn thành công! Task đã chuyển sang trạng thái chờ duyệt.');
            await loadNextTask();
        } catch (error) {
            console.error('Fetch Error:', error);
            alert('Không kết nối được server Java. Hãy kiểm tra backend đã chạy chưa.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>✏️ Nhiệm vụ gán nhãn dữ liệu</h2>
            {task ? (
                <p style={{ marginBottom: '20px', color: '#334155' }}>
                    <strong>Task:</strong> {task.taskId} | <strong>File:</strong> {task.fileName || 'N/A'} | <strong>Trạng thái:</strong> {task.status}
                </p>
            ) : (
                <p style={{ marginBottom: '20px', color: '#64748b' }}>
                    {isLoading ? 'Đang tải task...' : 'Không có task khả dụng để gán nhãn.'}
                </p>
            )}

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        style={{ cursor: task ? 'crosshair' : 'not-allowed', opacity: task ? 1 : 0.6 }}
                        onMouseDown={task ? handleMouseDown : undefined}
                        onMouseMove={task ? handleMouseMove : undefined}
                        onMouseUp={task ? handleMouseUp : undefined}
                    />
                </div>

                <div style={{ width: '320px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <h3>1. Chọn nhãn</h3>
                    <p style={{ marginBottom: '12px', color: '#64748b', fontSize: '13px' }}>
                        {projectId ? `Đang dùng bộ nhãn của dự án #${projectId}` : 'Đang dùng bộ nhãn mặc định'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {availableLabels.map((label) => (
                            <button
                                key={label.id}
                                onClick={() => setSelectedLabelId(label.id)}
                                style={{
                                    padding: '10px',
                                    backgroundColor: selectedLabelId === label.id ? label.color : '#fff',
                                    color: selectedLabelId === label.id ? '#fff' : '#000',
                                    cursor: 'pointer',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                }}
                            >
                                {label.id}. {label.name}
                            </button>
                        ))}
                    </div>

                    <hr />

                    <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                        <button
                            onClick={() => setBoxes([])}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#e74c3c', color: '#fff', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
                        >
                            Xóa tất cả
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!task || boxes.length === 0}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: !task || boxes.length === 0 ? '#94a3b8' : '#27ae60',
                                color: '#fff',
                                cursor: !task || boxes.length === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '6px',
                            }}
                        >
                            Hoàn thành & Lưu nhãn
                        </button>
                        <button
                            onClick={loadNextTask}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f766e', color: '#fff', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
                        >
                            Tải task mới nhất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnotationPage;