import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import sendemail from "../middlewares/sendotp.middleware.js";
import { generateReferenceCode } from "../utils/referenceCodeGenFun.js";
import OTP from "../models/otp.model.js";
import { uploadToImageKit } from "../utils/imageKit.js";
import { options } from "../constants.js";
const sendOtp = asyncHandler(async (res, req) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required.")
    }
    const isFristUser = await User.findOne({ email }).lean();
    if (isFristUser) {
        throw new ApiError(400, "You already have an account.")
    }
    const otp = Math.floor((Math.random() * 1000000) + 1);
    const referenceCode = generateReferenceCode();
    await sendemail(email, otp);
    const newOtp = new OTP({
        OTPNO: otp,
        referenceCode
    });
    await newOtp.save()
    return res.status(200).json(new ApiResponse(200, { referenceCode }, "The mail is alrady is send to your mail box."))
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { referenceCode, otp } = req.body;
    const findTheOtp = (
        await OTP.findOne(
            { referenceCode },
            { OTPNO: 1, _id: 0 }
        ).lean()
    )?.OTPNO;
    if (!findTheOtp) {
        throw new ApiError(400, "Invalid OTP")
    }
    if (findTheOtp == otp) {
        return res.status(200).json(new ApiResponse(200, null, "OTP Matched"))
    }
    throw new ApiError(400, 'Inavlid otp')


})

const register = asyncHandler(async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    if (!fullName || !bio || !password || !email) {
        throw new ApiError(400, 'All details are not found');
    }
    const isFristUser = await User.findOne({ email }).lean();
    if (isFristUser) {
        throw new ApiError(400, "You already have an account.")
    }
    let uploadResult;
    if (req.file) {
        const { buffer, mimetype, originalname, size } = req.file;
        if (!buffer || !mimetype || !originalname || !size) {
            throw new ApiError(400, "Invalid file upload");
        }
        const fileName = originalname || `logo_${companyId}_${Date.now()}`;
        uploadResult = await uploadToImageKit(buffer, fileName);
        if (!uploadResult || !uploadResult.url || !uploadResult.fileId) {
            throw new ApiError(500, "Failed to upload logo");
        }
    }
    const slat = await bcrypt.genSalt(12);
    const haspass = await bcrypt.hash(password, slat);
    const newuser = new User({
        fullName,
        email: email,
        userBio: bio ? bio : null,
        imageUrl: uploadResult?.url || 'https://ik.imagekit.io/ufopzzlbh/p.jpeg',
        password: haspass
    })
    await newuser.save();
    return res.status(201).json(new ApiResponse(201, null, 'User account is created'))
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, 'All details are not found');
    }

    const userdata = await User.findOne({ email }).lean();;
    if (!userdata) {
        throw new ApiError(400, "Invalid credential");
    }
    const varifyPassowrd = await bcrypt.compare(password, userdata.password);
    if (!varifyPassowrd) {
        throw new ApiError(400, 'Invalid credential')
    }
    const authToken = jwt.sign({
        userId: userdata._id,
        email: userdata.email,
    }, process.env.JWT_SERECT)
    return res
        .status(200)
        .cookie("authToken", authToken, options)
        .json(
            new ApiResponse(200, null, "User logged in successfully")
        )

})
export { sendOtp, verifyOtp , register , login}