document.getElementById("loadAvatars").addEventListener("click", () => {
    const avatarsDiv = document.getElementById("avatars");
    avatarsDiv.innerHTML = ""; // очистка перед загрузкой

    const avatarUrls = [
        "https://cc-lab4-pub-k11.s3.eu-central-1.amazonaws.com/avatars/user1.jpg",
        "https://cc-lab4-pub-k11.s3.eu-central-1.amazonaws.com/avatars/user2.jpg"
    ];

    avatarUrls.forEach(url => {
        const card = document.createElement("div");
        card.className = "card";
        const img = document.createElement("img");
        img.src = url;
        card.appendChild(img);
        avatarsDiv.appendChild(card);
    });
});
