const filesArr = [];
const formats = ["xls", "xlsx"];

function getFormat(name) {
    let format = name.split(".");
    return format[1];
};

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const openFileMethods = {
    error: (parent, element) => {
        let [text] = $(".text");
        parent.attr("class", "error_form");
        element.attr("src", "./assets/error.svg");
        text.innerText = "Неподдерживаемый  формат файла";
    },
    ready: (parent, element) => {
        let [text] = $(".text");
        element.attr("src", "./assets/ready.svg");
        parent.attr("class", "ready_form");
        text.innerText = "Для начала загрузки отпустите файл";
    },
    success: (parent, element) => {
        let [text] = $(".text");
        element.attr("src", "./assets/success.svg");
        parent.attr("class", "success_form");
        text.innerText = "Файл успешно загружен";

        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
                resolve();
                clearTimeout(timeout)
            }, 500);
        });
    },
    aftersubmit: (parent, element) => {
        let [text] = $(".text");
        let [input] = parent.find("input[type='file']")
        element.attr("src", "./assets/ready.svg");
        parent.attr("class", "aftersubmit_form");
        text.innerHTML = `Перетащите или выберите <a>файл для загрузки</a>`;
        input.type = "text";
        input.type = "file";
    },
    load: (file, parent) => {
        let [load_process, load_range, load_name] = parent.find(".load_process, .load_range, .load_filename");
        let [text] = $(".text");
        parent.attr("class", "load_form");
        text.innerText = file.name;

        return new Promise((resolve, reject) => {
            let st = 1000;
            let si = st / 100; 
            let width = 1;
            const interval = setInterval(async () => {
                if (width < 100) {
                    width++;
                    load_process.innerText = `Завершено ${width}%...`;
                    load_range.style.width = `${width}%`;
                } else {
                    clearInterval(interval);
                }
            }, si);

            let timeout = setTimeout(() => {
                resolve();
                if (width === 100) {
                    clearTimeout(timeout)
                }
            }, st);
        });
    }
};

function afterTest(file, form , element) {
    filesArr.push(file);
    openFileMethods.load(file, form).finally(() => successHandler(form, element))
};

function successHandler(form, element) {
    openFileMethods.success(form, element).finally(() => {
        openFileMethods.aftersubmit(form, element);
        displayFiles();
    });
}

function displayFiles() {
    let filesSTR = "";
    let [parent] = $(".files");
    filesArr.forEach((file) => {
        filesSTR += `
            <li class="file">
                <img src="./assets/fileIcon.svg">
                <span>${file.name}</span>
                <p>${formatBytes(file.size)}</p>
            </li>
        `;
    });
    parent.innerHTML = filesSTR;
}

$(document).ready(() => {
    let input = $("input[type='file']");
    let image = $("#form-image");
    let form = $("#form");

    input.on("change", ({ target: { files: [file] } }) => {
        let test = formats.find((format) => format === getFormat(file.name));
        console.log("render upper")
        if (test) {
            console.log("render")
            afterTest(file, form, image)
        } else {
            openFileMethods.error(form, image);
        }
    });

    $("#import-btn").click(() => {
        input.click()
    });

    $("#close-btn").click(() => {
        window.location.reload();
    });
});