let disk = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createDisk() {
    const size = parseInt(document.getElementById("diskSize").value);
    disk = new Array(size).fill(null);

    renderDisk();
    log("Disk created with size " + size);
}

function renderDisk() {
    const diskDiv = document.getElementById("disk");
    diskDiv.innerHTML = "";

    disk.forEach((block, i) => {
        const div = document.createElement("div");
        div.className = "block";

        if (block !== null) {
            div.classList.add("allocated");
            div.innerText = block;
        } else {
            div.innerText = i;
        }

        diskDiv.appendChild(div);
    });
}

function highlightBlock(i) {
    const blocks = document.querySelectorAll(".block");
    if (blocks[i]) {
        blocks[i].classList.add("highlight");
        setTimeout(() => {
            blocks[i].classList.remove("highlight");
        }, 300);
    }
}

async function allocateFile() {
    const name = document.getElementById("fileName").value;
    const size = parseInt(document.getElementById("fileSize").value);
    const strategy = document.getElementById("strategy").value;

    if (!name || !size) {
        alert("Enter file details!");
        return;
    }

    if (strategy === "sequential") {
        await sequentialAlloc(name, size);
    } else if (strategy === "linked") {
        await linkedAlloc(name, size);
    } else {
        await indexedAlloc(name, size);
    }

    renderDisk();
}

async function sequentialAlloc(name, size) {
    let count = 0;

    for (let i = 0; i < disk.length; i++) {
        highlightBlock(i);
        await sleep(300);

        if (disk[i] === null) {
            count++;
        } else {
            count = 0;
        }

        if (count === size) {
            for (let j = i - size + 1; j <= i; j++) {
                highlightBlock(j);
                await sleep(200);
                disk[j] = name;
            }
            log(`Sequential: ${name} allocated from ${i - size + 1} to ${i}`);
            return;
        }
    }

    log("Sequential allocation failed!");
}

async function linkedAlloc(name, size) {
    let freeBlocks = [];

    for (let i = 0; i < disk.length; i++) {
        if (disk[i] === null) freeBlocks.push(i);
    }

    if (freeBlocks.length < size) {
        log("Linked allocation failed!");
        return;
    }

    let selected = freeBlocks.slice(0, size);

    for (let i of selected) {
        highlightBlock(i);
        await sleep(300);
        disk[i] = name;
        renderDisk();
    }

    log(`Linked: ${name} -> ${selected.join(" -> ")}`);
}

async function indexedAlloc(name, size) {
    let freeBlocks = [];

    for (let i = 0; i < disk.length; i++) {
        if (disk[i] === null) freeBlocks.push(i);
    }

    if (freeBlocks.length < size + 1) {
        log("Indexed allocation failed!");
        return;
    }

    let indexBlock = freeBlocks[0];
    let fileBlocks = freeBlocks.slice(1, size + 1);

    highlightBlock(indexBlock);
    await sleep(400);
    disk[indexBlock] = name + "(I)";

    for (let i of fileBlocks) {
        highlightBlock(i);
        await sleep(300);
        disk[i] = name;
        renderDisk();
    }

    log(`Indexed: Index block ${indexBlock}, Data blocks: ${fileBlocks.join(", ")}`);
}

function log(msg) {
    document.getElementById("output").innerText += msg + "\n";
}