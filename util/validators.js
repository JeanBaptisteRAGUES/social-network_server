module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword
) => {
    const errors = {};
    if(username.trim() === ''){
        errors.username = "Le nom d'utilisateur ne doit pas être vide";
    }
    if(email.trim() === ''){
        errors.email = "L'email ne doit pas être vide";
    }else{
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if(!email.match(regEx)){
            errors.email = "Veuillez entrer une adresse mail valide";
        }
    }
    if(password === ''){
        errors.password = "Veuillez entrer un mot de passe";
    }else if(password !== confirmPassword){
        errors.confirmPassword = "Les mots de passe doivent être identiques";
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}

module.exports.validateLoginInput = (
    username,
    password
) => {
    const errors = {};
    if(username.trim() === ''){
        errors.username = "Veuillez indiquer votre nom d'utilisateur";
    }
    if(password === ''){
        errors.password = "Veuillez rentrer votre mot de passe";
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}