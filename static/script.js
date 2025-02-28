document.addEventListener("DOMContentLoaded", function () {
    let imagesData = [];
    let currentIndex = 0;

    // Lấy danh sách ảnh và câu hỏi
    fetch("/api/images")
        .then(response => response.json())
        .then(data => {
            imagesData = Object.entries(data);
            if (imagesData.length > 0) {
                loadImage(currentIndex);
            }
        });

    // Hiển thị ảnh + câu hỏi theo chỉ mục
    function loadImage(index) {
        if (index < 0 || index >= imagesData.length) return;

        const imageContainer = document.getElementById("image-container");
        const qaContainer = document.getElementById("qa-container");

        imageContainer.innerHTML = "";
        qaContainer.innerHTML = "";

        const [imageId, qaList] = imagesData[index];

        // Hiển thị hình ảnh
        const imgElement = document.createElement("img");
        imgElement.src = `/images/${imageId}`;
        const imgName = document.createElement("h2");
        imgName.textContent = imageId;

        imageContainer.appendChild(imgName);
        imageContainer.appendChild(imgElement);

        // Hiển thị danh sách câu hỏi
        qaList.forEach((qa, qaIndex) => {
            const qaItem = document.createElement("div");
            qaItem.classList.add("qa-item");

            // Ô nhập câu hỏi
            const question = document.createElement("textarea");
            question.classList.add("question-input");
            question.value = qa.Question;
            qaItem.appendChild(question);

            // Ô nhập câu trả lời
            const answerInput = document.createElement("textarea");
            answerInput.classList.add("answer-input");
            answerInput.value = qa.Answer;
            qaItem.appendChild(answerInput);

            // Hiển thị Explanation (chỉ đọc)
            const explanation = document.createElement("textarea");
            explanation.textContent = qa.Explanation;
            explanation.classList.add("explanation-input");
            explanation.setAttribute("readonly", true);
            qaItem.appendChild(explanation);

            // Checkbox Modified
            const modifiedLabel = document.createElement("label");
            modifiedLabel.textContent = "Modified: ";
            const modifiedCheckbox = document.createElement("input");
            modifiedCheckbox.type = "checkbox";
            modifiedCheckbox.checked = qa.Modified === "Yes";
            qaItem.appendChild(modifiedLabel);
            qaItem.appendChild(modifiedCheckbox);

            // Nút lưu
            const saveButton = document.createElement("button");
            saveButton.innerText = "Lưu";
            saveButton.classList.add("save-button");
            saveButton.addEventListener("click", function () {
                updateQA(imageId, qaIndex, question.value, answerInput.value, modifiedCheckbox.checked);
            });

            // Nút xóa
            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Xóa";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", function () {
                deleteQA(imageId, qaIndex);
            });

            qaItem.appendChild(saveButton);
            qaItem.appendChild(deleteButton);
            qaContainer.appendChild(qaItem);
        });

        // Cập nhật giá trị input vị trí hiện tại
        document.getElementById("image-index-input").value = index + 1;
    }

    // Chuyển ảnh
    document.getElementById("next-button").addEventListener("click", function () {
        if (currentIndex < imagesData.length - 1) {
            currentIndex++;
            loadImage(currentIndex);
        }
    });

    document.getElementById("prev-button").addEventListener("click", function () {
        if (currentIndex > 0) {
            currentIndex--;
            loadImage(currentIndex);
        }
    });

    // Nhảy đến ảnh mong muốn
    document.getElementById("goto-button").addEventListener("click", function () {
        const indexInput = document.getElementById("image-index-input").value;
        const newIndex = parseInt(indexInput, 10) - 1;
        if (!isNaN(newIndex) && newIndex >= 0 && newIndex < imagesData.length) {
            currentIndex = newIndex;
            loadImage(currentIndex);
        } else {
            alert("Vui lòng nhập một số hợp lệ!");
        }
    });

    // Cập nhật dữ liệu
    function updateQA(imageId, qaIndex, newQuestion, newAnswer, modified) {
        fetch(`/api/update-qa/${imageId}/${qaIndex}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: newQuestion, answer: newAnswer, modified: modified })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        });
    }

    // Xóa dữ liệu
    function deleteQA(imageId, qaIndex) {
        if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;

        fetch(`/api/delete-qa/${imageId}/${qaIndex}`, {
            method: "DELETE"
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            imagesData = imagesData.map(([id, qas]) => id === imageId ? [id, qas.filter((_, i) => i !== qaIndex)] : [id, qas]);
            loadImage(currentIndex);
        });
    }
});
