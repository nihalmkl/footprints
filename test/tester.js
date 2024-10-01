const otpInput = document.getElementById('otp').value
$.ajax({
    type:"POST",
    url:"verify_otp",
    data:{otp:otpInput},
    success:(res)=>{
       if(res.success){
        swal
       }
    }
})