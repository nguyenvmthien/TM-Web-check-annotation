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

        imageContainer.innerHTML = ""; // Xóa nội dung cũ
        qaContainer.innerHTML = "";

        const [imageId, qaList] = imagesData[index];

        // Hiển thị hình ảnh
        const imgElement = document.createElement("img");
        imgElement.src = `/images/${imageId}`;
        const imgName = document.createElement("h2");
        imgName.textContent = imageId;
        
        imageContainer.appendChild(imgName);
        imageContainer.appendChild(imgElement);

        // Hiển thị câu hỏi và câu trả lời
        qaList.forEach((qa, qaIndex) => {
            const qaItem = document.createElement("div");
            qaItem.classList.add("qa-item");

            const question = document.createElement("textarea");
            question.classList.add("answer-input");
            question.innerText = qa.Question;
            qaItem.appendChild(question);

            const answerInput = document.createElement("textarea");
            answerInput.classList.add("answer-input");
            answerInput.value = qa.Answer;
            answerInput.dataset.imageId = imageId;
            answerInput.dataset.qaIndex = qaIndex;
            qaItem.appendChild(answerInput);

            const saveButton = document.createElement("button");
            saveButton.innerText = "Lưu";
            saveButton.classList.add("save-button");
            saveButton.addEventListener("click", function () {
                updateAnswer(imageId, qaIndex, answerInput.value);
            });

            qaItem.appendChild(saveButton);
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
        console.log( imagesData.length);
        if (!isNaN(newIndex) && newIndex >= 0 && newIndex < imagesData.length) {
            currentIndex = newIndex;
            loadImage(currentIndex);
        } else {
            alert("Vui lòng nhập một số hợp lệ!");
        }
    });

    // Cập nhật câu trả lời
    function updateAnswer(imageId, qaIndex, newAnswer) {
        fetch(`/api/update-answer/${imageId}/${qaIndex}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ answer: newAnswer })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        });
    }
});
