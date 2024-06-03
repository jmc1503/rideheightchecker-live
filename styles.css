/* Apply Righteous font to all elements */
@import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');

* {
    font-family: 'Righteous', sans-serif;
}

body {
    background-color: #5de8d5;
    margin: 0;
    padding: 0;
}

header {
    width: 100%;
    background-color: transparent; /* Make header background transparent */
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

header img {
    height: 200px; /* Adjust this value to make the logo bigger */
    transition: height 0.3s ease;
}

header.shrink img {
    height: 100px; /* Adjust this value to make the logo smaller on scroll */
}

@media (max-width: 768px) {
    header img {
        height: 90px; /* Adjust this value for smaller screens */
    }

    header.shrink img {
        height: 60px; /* Adjust this value to make the logo smaller on scroll */
    }
}

.container {
    max-width: 600px; /* Set a smaller default width */
    margin: 200px auto 50px auto; /* Adjust margin to account for fixed header */
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 300px #007bff; /* Add slight shadow to the container */
    transition: max-width 0.3s ease; /* Add transition for smooth width change */
}

.container.results-shown {
    max-width: 1200px; /* Expand width when results are shown */
}

form {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input, select, button {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
}

button {
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

#result-container {
    display: none;
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px; /* Add gap between cards */
}

.park-card {
    flex: 1 1 calc(25% - 20px); /* Set the width of each card to one-fourth of the container minus the gap */
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 15px #C023D2; /* Add bigger shadow to each card */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Ensure the More Information button is at the bottom */
}

.park-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.park-info {
    margin-bottom: 10px;
}

.ride-info ul li {
    font-weight: 300; /* Lighter font weight for ride names */
}

.more-info-btn {
    margin-top: auto; /* Push the button to the bottom of the card */
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
    text-align: center;
    font-size: smaller; /* Make text slightly smaller */
}

.more-info-btn:hover {
    color: #0056b3;
}

.action-btn {
    width: 100%;
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin-top: 10px;
    text-align: center;
    font-size: 1.2em; /* Make text and emoji bigger */
}

.action-btn:hover {
    background-color: #0056b3;
}

.view-toggle {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
    display: none; /* Hide view toggle buttons initially */
}

.view-toggle button {
    width: 45%;
}

#map {
    height: 400px;
    display: none;
}

/* Modal styles */
.modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

.form-group {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}

.form-field {
    flex: 1 1 calc(33.33% - 10px);
    margin-right: 10px;
}

.find-rides-container {
    flex: 1 1 100%;
    display: flex;
    justify-content: center;
}

.find-rides-container button {
    width: 25%;
    padding: 10px;
}

.reset-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

.reset-container span {
    cursor: pointer;
    color: lightgrey;
}

.reset-container span:hover {
    color: grey;
}

@media (max-width: 768px) {
    .form-field {
        flex: 1 1 100%;
        margin-right: 0;
        margin-bottom: 10px;
    }

    .find-rides-container {
        flex-direction: column;
        align-items: center;
    }

    .find-rides-container button {
        width: 100%;
    }

    .find-rides-container .reset-btn {
        margin-top: 10px;
    }

    #result-container {
        flex-direction: column; /* Single column on mobile */
    }

    header img {
        height: 90px; /* Smaller logo on mobile */
    }

    header.shrink img {
        height: 60px; /* Smaller logo on mobile scroll */
    }
}
