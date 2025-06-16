window.addEventListener("load", initialize);

let drawColor;
let generationCounter = 0;
let global_amplification;

function initialize() {
    drawColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-stone-300')
        .trim();

    const canvas = document.getElementById('tree-canvas');
    const parent = canvas.parentElement;

    // Set canvas resolution to match parent size
    const resizeCanvas = () => {
        const { width, height } = parent.getBoundingClientRect();
        generationCounter += 1;
        canvas.width = width;
        canvas.height = height;
        global_amplification = 0.8 + width / 4000;
        let depth = Math.min(6 + Math.floor(width / 200), 11);
        const expected_height = Array(depth)
            .keys()
            .map(x => 10 + (global_amplification * x * 8.1))
            .reduce((sum, x) => sum + x, 0);
        draw(canvas, width, expected_height + 230, depth, generationCounter);
    };

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
}

function draw(canvas, width, height, depth, generation) {
    // Simply draw nothing if it's not supported
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');
        const start = width / 2;
        const angle = -90 * Math.PI / 180.0;
        drawTree(ctx, start, height, angle - randomAngle(), depth - 1, generation);
        drawTree(ctx, start, height, angle + randomAngle(), depth - 1, generation);
    }
}

function drawTree(ctx, x1, y1, angle, depth, generation){
    const len = 10 + Math.floor(7 + Math.random() * 3) * depth * global_amplification;

    if (depth > 0){
        const x2 = x1 + (Math.cos(angle) * len);
        const y2 = y1 + (Math.sin(angle) * len);
        
        const duration = depthDuration(depth);
        animateLine(ctx, x1, y1, x2, y2, depth, generation, duration);
        setTimeout(() => {
            if (generation == generationCounter) {
                drawTree(ctx, x2, y2, angle - randomAngle(), depth - 1, generation);
                drawTree(ctx, x2, y2, angle + randomAngle(), depth - 1, generation);
            }
        }, duration);
    }
}

function depthDuration(depth) {
    return ((1 + Math.random() * 4) / Math.pow(depth, 2.5)) * 16000;
}

function drawLine(ctx, x1, y1, x2, y2, depth, generation, duration){
    if (generation != generationCounter) {
        return;
    }
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = depth * 1.5;
    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.closePath();
    ctx.stroke();
}

function animateLine(ctx, x1, y1, x2, y2, depth, generation, duration) {
    let start;

    function animate(progress) {
        drawLine(ctx, x1, y1, x1 + (x2 - x1) * progress, y1 + (y2 - y1) * progress, depth, generation);

        if (progress < 1) {
            requestAnimationFrame((timestamp) => {
                let progress;
                if (start === undefined) {
                    start = timestamp;
                    progress = 0;
                } else {
                    progress = Math.min((timestamp - start) / duration, 1);
                }
                animate(progress)
            });
        }
    }
    animate(0);
}

function randomAngle() {
    return 0.3 + Math.random() / 20
}
