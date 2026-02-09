<template>
  <CommonLayout headerType="standard" title="学生认证" showBack bgWhite>
    <view class="verify-page">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-container">
        <AsyncLoading text="加载中..." />
      </view>

      <!-- 申请表单 -->
      <view
        v-else-if="currentAction === ACTION_VALUES.apply"
        class="content-container"
      >
        <view class="notice-bar">
          <wd-icon
            class-prefix="iconfont"
            name="graduation-cap"
            size="16px"
            color="#3b82f6"
          ></wd-icon>
          <text class="text"
            >本平台仅对在校大学生开放。请提供真实的学校和学籍信息，认证通过后将获得学生专属标识。</text
          >
        </view>

        <view class="form-section">
          <view class="form-title">填写学生信息</view>

          <view class="form-group">
            <view class="input-item">
              <text class="label required">真实姓名</text>
              <input
                id="verify-realname"
                name="realname"
                class="custom-input"
                placeholder="请输入真实姓名"
                placeholder-class="ph-style"
                v-model="formData.realName"
              />
            </view>

            <view class="input-item">
              <text class="label required">学校名称</text>
              <input
                id="verify-school"
                name="school"
                class="custom-input"
                placeholder="请输入学校全称"
                placeholder-class="ph-style"
                v-model="formData.schoolName"
              />
            </view>

            <view class="input-item">
              <text class="label required">院系</text>
              <input
                id="verify-department"
                name="department"
                class="custom-input"
                placeholder="请输入院系"
                placeholder-class="ph-style"
                v-model="formData.department"
              />
            </view>

            <view class="input-item">
              <text class="label required">入学年份</text>
              <picker
                id="verify-admission-year"
                name="admission-year"
                mode="date"
                fields="year"
                :end="String(new Date().getFullYear())"
                @change="onYearChange"
              >
                <view class="picker-input">
                  {{ formData.admissionYear || "请选择入学年份" }}
                  <wd-icon name="arrow-down" size="14px" color="#999"></wd-icon>
                </view>
              </picker>
            </view>

            <view class="input-item">
              <text class="label required">学号</text>
              <input
                id="verify-student-id"
                name="student-id"
                class="custom-input"
                placeholder="请输入学号"
                placeholder-class="ph-style"
                v-model="formData.studentId"
              />
            </view>
          </view>

          <view class="upload-section">
            <view class="section-title">
              <text>上传学生证/校园卡</text>
              <text class="tip">支持 jpg/jpeg/png，单张不超过 5MB</text>
            </view>

            <view class="upload-grid">
              <view class="upload-box" @click="handleUpload('front')">
                <view v-if="formData.frontImage" class="image-preview">
                  <image
                    :src="formData.frontImagePreview || formData.frontImage"
                    mode="aspectFill"
                  ></image>
                  <view class="remove-btn" @click.stop="removeImage('front')">
                    <wd-icon name="close" size="12px" color="#fff"></wd-icon>
                  </view>
                </view>
                <view v-else class="icon-container">
                  <wd-icon
                    class-prefix="iconfont"
                    name="id-card-clip"
                    size="44rpx"
                    color="#cbd5e1"
                  ></wd-icon>
                  <text class="upload-text">正面（含照面）</text>
                </view>
              </view>

              <view class="upload-box" @click="handleUpload('back')">
                <view v-if="formData.backImage" class="image-preview">
                  <image
                    :src="formData.backImagePreview || formData.backImage"
                    mode="aspectFill"
                  ></image>
                  <view class="remove-btn" @click.stop="removeImage('back')">
                    <wd-icon name="close" size="12px" color="#fff"></wd-icon>
                  </view>
                </view>
                <view v-else class="icon-container">
                  <wd-icon
                    class-prefix="iconfont"
                    name="book"
                    size="44rpx"
                    color="#cbd5e1"
                  ></wd-icon>
                  <text class="upload-text">详情面</text>
                </view>
              </view>
            </view>
          </view>

          <button
            class="submit-btn"
            :disabled="submitting"
            hover-class="btn-hover"
            @click="handleSubmit"
          >
            {{ submitting ? "提交中..." : "提交认证" }}
          </button>
        </view>
      </view>

      <!-- OCR 识别中 -->
      <view
        v-else-if="currentAction === ACTION_VALUES.wait_ocr"
        class="status-container"
      >
        <view class="status-icon-wrapper">
          <view class="loading-spinner"></view>
        </view>
        <text class="status-title">正在识别学生证信息</text>
        <text class="status-desc"
          >我们正在使用 AI 识别您的学生证信息，请稍候...</text
        >
        <view class="progress-tips">
          <view class="tip-item">
            <wd-icon name="check" size="16px" color="#10b981"></wd-icon>
            <text>上传完成</text>
          </view>
          <view class="tip-item">
            <view class="mini-loading"></view>
            <text>OCR 识别中</text>
          </view>
          <view class="tip-item">
            <wd-icon name="time" size="16px" color="#cbd5e1"></wd-icon>
            <text>等待确认</text>
          </view>
        </view>
      </view>

      <!-- 确认信息 -->
      <view
        v-else-if="currentAction === ACTION_VALUES.confirm"
        class="content-container"
      >
        <view class="notice-bar confirm">
          <wd-icon name="info-circle" size="16px" color="#f59e0b"></wd-icon>
          <text class="text"
            >请确认 OCR
            识别的信息是否准确。如需修改，请点击"修改信息"按钮。</text
          >
        </view>

        <view class="confirm-section">
          <view class="confirm-title">请确认以下信息</view>

          <view class="info-card">
            <view class="info-row">
              <text class="label">真实姓名</text>
              <text class="value">{{ verifyData?.real_name || "-" }}</text>
            </view>
            <view class="info-row">
              <text class="label">学校名称</text>
              <text class="value">{{ verifyData?.school_name || "-" }}</text>
            </view>
            <view class="info-row">
              <text class="label">院系</text>
              <text class="value">{{ verifyData?.department || "-" }}</text>
            </view>
            <view class="info-row">
              <text class="label">入学年份</text>
              <text class="value">{{ verifyData?.admission_year || "-" }}</text>
            </view>
            <view class="info-row">
              <text class="label">学号</text>
              <text class="value">{{ verifyData?.student_id || "-" }}</text>
            </view>
          </view>

          <view class="action-buttons">
            <button
              class="modify-btn"
              hover-class="btn-hover"
              @click="showModifyModal = true"
            >
              修改信息
            </button>
            <button
              class="confirm-btn"
              :disabled="confirming"
              hover-class="btn-hover"
              @click="handleConfirm(true)"
            >
              {{ confirming ? "确认中..." : "确认无误" }}
            </button>
          </view>
        </view>
      </view>

      <!-- 等待人工审核 -->
      <view
        v-else-if="currentAction === ACTION_VALUES.wait_manual"
        class="status-container"
      >
        <view class="status-icon-wrapper manual">
          <wd-icon name="search" size="80rpx" color="#3b82f6"></wd-icon>
        </view>
        <text class="status-title">人工审核中</text>
        <text class="status-desc">{{
          statusDesc || "您已确认信息，工作人员将在 1-3 个工作日内完成审核"
        }}</text>
        <view class="info-tips">
          <view class="tip-title">审核说明</view>
          <text>• 工作时间：周一至周五 9:00-18:00</text>
          <text>• 审核时长：1-3 个工作日</text>
          <text>• 审核结果将通过消息通知</text>
        </view>
      </view>

      <!-- 认证完成 -->
      <view
        v-else-if="currentAction === ACTION_VALUES.done"
        class="status-container success"
      >
        <view class="status-icon-wrapper success">
          <wd-icon name="check-circle" size="80rpx" color="#10b981"></wd-icon>
        </view>
        <text class="status-title">认证成功</text>
        <text class="status-desc">{{
          statusDesc || "恭喜！您已通过学生认证"
        }}</text>

        <view class="success-card">
          <view class="success-title">认证信息</view>
          <view class="info-row">
            <text class="label">认证学校</text>
            <text class="value">{{ verifyData?.school_name || "-" }}</text>
          </view>
          <view class="info-row">
            <text class="label">认证时间</text>
            <text class="value">{{ formatVerifyTime() }}</text>
          </view>
        </view>

        <button class="back-btn" hover-class="btn-hover" @click="handleBack">
          返回个人中心
        </button>
      </view>

      <!-- 认证被拒绝 -->
      <view
        v-else-if="currentAction === ACTION_VALUES.rejected"
        class="status-container failed"
      >
        <view class="status-icon-wrapper failed">
          <wd-icon name="close-circle" size="80rpx" color="#ef4444"></wd-icon>
        </view>
        <text class="status-title">认证未通过</text>
        <text class="status-desc">{{
          statusDesc || "很抱歉，您的认证申请未通过"
        }}</text>

        <view v-if="rejectReason" class="reject-reason">
          <view class="reason-title">拒绝原因</view>
          <text class="reason-text">{{ rejectReason }}</text>
        </view>

        <button class="retry-btn" hover-class="btn-hover" @click="handleRetry">
          重新申请
        </button>
      </view>

      <!-- 修改信息弹窗 -->
      <view
        v-if="showModifyModal"
        class="modal-overlay"
        @click="showModifyModal = false"
      >
        <view class="modal-container" @click.stop>
          <view class="modal-header">
            <text class="modal-title">修改信息</text>
            <view class="modal-close" @click="showModifyModal = false">
              <wd-icon name="close" size="20px" color="#999"></wd-icon>
            </view>
          </view>

          <view class="modal-body">
            <view class="input-item">
              <text class="label required">真实姓名</text>
              <input
                id="verify-realname-modify"
                name="realname-modify"
                class="custom-input"
                v-model="modifiedData.real_name"
                placeholder="请输入真实姓名"
              />
            </view>
            <view class="input-item">
              <text class="label required">学校名称</text>
              <input
                id="verify-school-modify"
                name="school-modify"
                class="custom-input"
                v-model="modifiedData.school_name"
                placeholder="请输入学校名称"
              />
            </view>
            <view class="input-item">
              <text class="label required">院系</text>
              <input
                id="verify-department-modify"
                name="department-modify"
                class="custom-input"
                v-model="modifiedData.department"
                placeholder="请输入院系"
              />
            </view>
            <view class="input-item">
              <text class="label required">入学年份</text>
              <picker
                id="verify-admission-year-modify"
                name="admission-year-modify"
                mode="date"
                fields="year"
                :end="String(new Date().getFullYear())"
                :value="modifiedData.admission_year"
                @change="onModifyYearChange"
              >
                <view class="picker-input">
                  {{ modifiedData.admission_year || "请选择入学年份" }}
                  <wd-icon name="arrow-down" size="14px" color="#999"></wd-icon>
                </view>
              </picker>
            </view>
            <view class="input-item">
              <text class="label required">学号</text>
              <input
                id="verify-student-id-modify"
                name="student-id-modify"
                class="custom-input"
                v-model="modifiedData.student_id"
                placeholder="请输入学号"
              />
            </view>
          </view>

          <view class="modal-footer">
            <button class="modal-cancel-btn" @click="showModifyModal = false">
              取消
            </button>
            <button
              class="modal-confirm-btn"
              :disabled="confirming"
              @click="handleConfirm(false)"
            >
              {{ confirming ? "提交中..." : "提交修改" }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  getAuthProgress,
  postStudentAuth,
  postStudentAuthConfirm,
  postStudentAuthCancel,
} from "@/api/profile/router";
import type {
  GetStudentAuthProgressData,
  PostStudentAuthRequest,
  PostStudentAuthConfirmRequest,
  ModifiedData,
} from "@/types/modules/profile.d";
import { NeedAction } from "@/types/modules/profile.d";

// 状态管理
const loading = ref(true);
const submitting = ref(false);
const confirming = ref(false);
const showModifyModal = ref(false);

// 认证进度数据
const authProgress = ref<GetStudentAuthProgressData>({
  has_record: false,
  verify_id: 0,
  status: -1,
  status_desc: "",
  can_apply: true,
  can_confirm: false,
  can_cancel: false,
  need_action: NeedAction.Apply, // 默认显示申请表单
});

// verifyData
const verifyData = ref<GetStudentAuthProgressData["verify_data"] | null>(null);

// NeedAction 枚举值映射（用于模板比较）
const ACTION_VALUES = {
  apply: "apply",
  wait_ocr: "wait_ocr",
  confirm: "confirm",
  wait_manual: "wait_manual",
  done: "done",
  rejected: "rejected",
} as const;

// 表单数据
const formData = ref({
  realName: "",
  schoolName: "",
  department: "",
  admissionYear: "",
  studentId: "",
  frontImage: "" as string,
  frontImagePreview: "", // H5 预览用
  backImage: "" as string,
  backImagePreview: "", // H5 预览用
});

// 修改后的数据
const modifiedData = ref<ModifiedData>({});

// 计算属性
const currentAction = computed(() => {
  const action = authProgress.value?.need_action;
  console.log("authProgress.value:", authProgress.value);
  console.log("need_action:", action);
  console.log("currentAction:", action);
  return action || NeedAction.Apply;
});

const statusDesc = computed(() => authProgress.value?.status_desc || "");
const rejectReason = computed(() => authProgress.value?.reject_reason || "");
const verifyId = computed(() => authProgress.value?.verify_id || 0);

// 格式化认证时间
const formatVerifyTime = () => {
  if (verifyData.value?.verified_at) {
    const date = new Date(verifyData.value.verified_at);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return "-";
};

// 页面加载时获取认证进度
onMounted(async () => {
  await fetchAuthProgress();
});

// 后端 need_action 中文描述到前端枚举值的映射
const mapNeedActionToEnum = (action: string | undefined): NeedAction => {
  if (!action) return NeedAction.Apply;

  // 根据后端返回的中文描述映射到前端枚举值
  const actionMap: Record<string, NeedAction> = {
    请填写认证信息: NeedAction.Apply,
    等待OCR识别: NeedAction.WaitOcr,
    请确认识别信息: NeedAction.Confirm,
    等待人工审核: NeedAction.WaitManual,
    认证已完成: NeedAction.Done,
    认证被拒绝: NeedAction.Rejected,
    // 同时支持直接返回枚举值的情况
    apply: NeedAction.Apply,
    wait_ocr: NeedAction.WaitOcr,
    confirm: NeedAction.Confirm,
    wait_manual: NeedAction.WaitManual,
    done: NeedAction.Done,
    rejected: NeedAction.Rejected,
  };

  return actionMap[action] || NeedAction.Apply;
};

// 获取认证进度
const fetchAuthProgress = async () => {
  loading.value = true;
  try {
    const response = await getAuthProgress();
    if (response.data) {
      // 映射 need_action 从中文描述到枚举值
      const mappedAction = mapNeedActionToEnum(response.data.need_action);

      authProgress.value = {
        ...authProgress.value,
        ...response.data,
        need_action: mappedAction, // 使用映射后的枚举值
      };
      verifyData.value = response.data.verify_data || null;

      // 如果有识别数据，初始化修改表单
      if (verifyData.value) {
        modifiedData.value = { ...verifyData.value };
      }

      console.log("认证进度:", authProgress.value);
      console.log("原始 need_action:", response.data.need_action);
      console.log("映射后 need_action:", mappedAction);
    }
  } catch (error) {
    console.error("获取认证进度失败:", error);
    // API 失败时，保持默认值（显示申请表单）
    uni.showToast({ title: "加载失败，请重试", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 选择年份
const onYearChange = (e: any) => {
  formData.value.admissionYear = e.detail.value;
};

const onModifyYearChange = (e: any) => {
  modifiedData.value.admission_year = e.detail.value;
};

// 上传图片
const handleUpload = (type: "front" | "back") => {
  // #ifdef H5
  // H5 环境：使用 input[type=file]
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/jpg,image/png";
  input.onchange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
      uni.showToast({ title: "图片大小不能超过5MB", icon: "none" });
      return;
    }

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);

    if (type === "front") {
      formData.value.frontImage = file; // 直接存储 File 对象
      formData.value.frontImagePreview = previewUrl; // 用于预览
    } else {
      formData.value.backImage = file;
      formData.value.backImagePreview = previewUrl;
    }
  };
  input.click();
  // #endif

  // #ifndef H5
  // 小程序/App 环境：使用 uni.chooseImage
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths[0]) {
        // 检查文件大小（5MB限制）
        uni.getFileInfo({
          filePath: res.tempFilePaths[0],
          success: (fileInfo) => {
            if (fileInfo.size > 5 * 1024 * 1024) {
              uni.showToast({ title: "图片大小不能超过5MB", icon: "none" });
              return;
            }
            if (type === "front") {
              formData.value.frontImage = res.tempFilePaths[0];
            } else {
              formData.value.backImage = res.tempFilePaths[0];
            }
          },
        });
      }
    },
  });
  // #endif
};

// 删除图片
const removeImage = (type: "front" | "back") => {
  if (type === "front") {
    formData.value.frontImage = "";
    formData.value.frontImagePreview = "";
    // #ifdef H5
    // 清理 Blob URL，释放内存
    if (formData.value.frontImagePreview) {
      URL.revokeObjectURL(formData.value.frontImagePreview);
    }
    // #endif
  } else {
    formData.value.backImage = "";
    formData.value.backImagePreview = "";
    // #ifdef H5
    if (formData.value.backImagePreview) {
      URL.revokeObjectURL(formData.value.backImagePreview);
    }
    // #endif
  }
};

// 提交认证申请
const handleSubmit = async () => {
  // 表单验证
  if (!formData.value.realName?.trim()) {
    uni.showToast({ title: "请输入真实姓名", icon: "none" });
    return;
  }
  if (!formData.value.schoolName?.trim()) {
    uni.showToast({ title: "请输入学校名称", icon: "none" });
    return;
  }
  if (!formData.value.department?.trim()) {
    uni.showToast({ title: "请输入院系", icon: "none" });
    return;
  }
  if (!formData.value.admissionYear) {
    uni.showToast({ title: "请选择入学年份", icon: "none" });
    return;
  }
  if (!formData.value.studentId?.trim()) {
    uni.showToast({ title: "请输入学号", icon: "none" });
    return;
  }
  if (!formData.value.frontImage) {
    uni.showToast({ title: "请上传学生证正面照片", icon: "none" });
    return;
  }
  if (!formData.value.backImage) {
    uni.showToast({ title: "请上传学生证详情面照片", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    const authData: PostStudentAuthRequest = {
      real_name: formData.value.realName,
      school_name: formData.value.schoolName,
      department: formData.value.department,
      admission_year: formData.value.admissionYear,
      student_id: formData.value.studentId,
      front_image: formData.value.frontImage,
      back_image: formData.value.backImage,
    };

    // 使用支持文件上传的方法（multipart/form-data 格式）
    await postStudentAuth(authData);
    uni.showToast({ title: "提交成功，正在识别", icon: "success" });

    // 重新获取进度
    setTimeout(() => {
      fetchAuthProgress();
    }, 1000);
  } catch (error) {
    console.error("提交认证申请失败:", error);
  } finally {
    submitting.value = false;
  }
};

// 确认或修改信息
const handleConfirm = async (isConfirmed: boolean) => {
  if (!verifyId.value) {
    uni.showToast({ title: "认证ID无效", icon: "none" });
    return;
  }

  // 如果是修改，验证表单
  if (!isConfirmed) {
    if (
      !modifiedData.value.real_name?.trim() ||
      !modifiedData.value.school_name?.trim() ||
      !modifiedData.value.department?.trim() ||
      !modifiedData.value.admission_year ||
      !modifiedData.value.student_id?.trim()
    ) {
      uni.showToast({ title: "请填写完整信息", icon: "none" });
      return;
    }
  }

  confirming.value = true;
  try {
    const confirmData: PostStudentAuthConfirmRequest = {
      verify_id: verifyId.value,
      is_confirmed: isConfirmed,
      modified_data: isConfirmed ? undefined : modifiedData.value,
    };

    await postStudentAuthConfirm(confirmData);

    if (isConfirmed) {
      uni.showToast({ title: "确认成功", icon: "success" });
    } else {
      uni.showToast({ title: "修改已提交", icon: "success" });
      showModifyModal.value = false;
    }

    // 重新获取进度
    setTimeout(() => {
      fetchAuthProgress();
    }, 1000);
  } catch (error) {
    console.error("确认/修改失败:", error);
  } finally {
    confirming.value = false;
  }
};

// 重新申请
const handleRetry = () => {
  // 清理 Blob URLs
  // #ifdef H5
  if (formData.value.frontImagePreview) {
    URL.revokeObjectURL(formData.value.frontImagePreview);
  }
  if (formData.value.backImagePreview) {
    URL.revokeObjectURL(formData.value.backImagePreview);
  }
  // #endif

  formData.value = {
    realName: "",
    schoolName: "",
    department: "",
    admissionYear: "",
    studentId: "",
    frontImage: "",
    frontImagePreview: "",
    backImage: "",
    backImagePreview: "",
  };
  authProgress.value = { need_action: NeedAction.Apply };
};

// 返回
const handleBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.verify-page {
  min-height: 100vh;
  background: #f6faff;
}

.loading-container {
  @include flex(column, center, center);
  min-height: 80vh;
}

.content-container {
  padding: $spacing-lg;
}

// 公告栏
.notice-bar {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1rpx solid #bfdbfe;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  @include flex(row, flex-start, flex-start);
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;

  &.confirm {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-color: #fed7aa;
  }

  .text {
    flex: 1;
    font-size: $font-size-sm;
    color: #1d4ed8;
    line-height: 1.6;

    .confirm & {
      color: #c2410c;
    }
  }
}

// 表单区域
.form-section {
  background: #fff;
  border-radius: $border-radius-xl;
  padding: $spacing-xl;
  box-shadow: $shadow-sm;

  .form-title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-lg;
  }

  .form-group {
    margin-bottom: $spacing-xl;

    .input-item {
      margin-bottom: $spacing-lg;

      .label {
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-secondary;
        margin-bottom: $spacing-sm;
        display: block;

        &.required::before {
          content: "*";
          color: $accent-color;
          margin-right: 4rpx;
        }
      }

      .custom-input {
        width: 100%;
        height: 88rpx;
        background: #f9fafb;
        border: 1rpx solid $border-light;
        border-radius: $border-radius-md;
        padding: 24rpx;
        font-size: $font-size-base;
        color: $text-primary;
        box-sizing: border-box;

        &:focus {
          border-color: $primary-color;
          background: #fff;
        }
      }

      .picker-input {
        @include flex(row, space-between, center);
        background: #f9fafb;
        border: 1rpx solid $border-light;
        border-radius: $border-radius-lg;
        padding: 24rpx;
        font-size: $font-size-base;
        color: $text-primary;
      }
    }
  }

  .upload-section {
    .section-title {
      @include flex(row, space-between, center);
      margin-bottom: $spacing-md;

      text {
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-secondary;
      }

      .tip {
        font-size: $font-size-xs;
        color: $text-tertiary;
        font-weight: 400;
      }
    }

    .upload-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: $spacing-md;

      .upload-box {
        aspect-ratio: 3/2;
        background: #f9fafb;
        border: 2rpx dashed $border-color;
        border-radius: $border-radius-lg;
        @include flex(column, center, center);
        gap: $spacing-sm;
        position: relative;
        overflow: hidden;

        .icon-container {
          @include flex(column, center, center);
          gap: $spacing-sm;
        }

        .upload-text {
          font-size: $font-size-sm;
          color: $text-tertiary;
        }

        .image-preview {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          image {
            width: 100%;
            height: 100%;
          }

          .remove-btn {
            position: absolute;
            top: 8rpx;
            right: 8rpx;
            width: 48rpx;
            height: 48rpx;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            @include flex(row, center, center);
          }
        }
      }
    }
  }

  .submit-btn {
    width: 100%;
    margin-top: $spacing-xl;
    height: 96rpx;
    background: $primary-color;
    color: #fff;
    border-radius: $border-radius-full;
    font-size: $font-size-base;
    font-weight: 700;
    box-shadow: 0 8rpx 16rpx rgba(249, 115, 22, 0.3);

    &[disabled] {
      opacity: 0.6;
    }
  }
}

// 状态容器
.status-container {
  @include flex(column, center, center);
  padding: $spacing-xl;
  min-height: 70vh;

  .status-icon-wrapper {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    @include flex(row, center, center);
    margin-bottom: $spacing-lg;
    position: relative;

    &.manual {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    }

    &.success {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    &.failed {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }
  }

  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid #e5e7eb;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .status-title {
    font-size: 48rpx;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  .status-desc {
    font-size: $font-size-base;
    color: $text-tertiary;
    text-align: center;
    max-width: 80%;
    line-height: 1.6;
    margin-bottom: $spacing-xl;
  }

  .progress-tips {
    width: 100%;
    max-width: 400rpx;
    background: #fff;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;

    .tip-item {
      @include flex(row, center, center);
      gap: $spacing-sm;
      padding: $spacing-sm 0;

      text {
        font-size: $font-size-base;
        color: $text-secondary;
      }

      .mini-loading {
        width: 16rpx;
        height: 16rpx;
        border: 2rpx solid #e5e7eb;
        border-top-color: $primary-color;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }
  }

  .info-tips {
    width: 100%;
    max-width: 480rpx;
    background: #fff;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-top: $spacing-xl;

    .tip-title {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: $spacing-md;
    }

    text {
      display: block;
      font-size: $font-size-sm;
      color: $text-tertiary;
      line-height: 2;
    }
  }

  .success-card,
  .reject-reason {
    width: 100%;
    max-width: 480rpx;
    background: #fff;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-xl;

    .success-title,
    .reason-title {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: $spacing-md;
    }

    .reason-text {
      font-size: $font-size-sm;
      color: $accent-color;
      line-height: 1.6;
    }

    .info-row {
      @include flex(row, space-between, center);
      padding: $spacing-sm 0;

      .label {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }

      .value {
        font-size: $font-size-sm;
        font-weight: 600;
        color: $text-primary;
      }
    }
  }

  .back-btn,
  .retry-btn {
    width: 100%;
    max-width: 400rpx;
    height: 88rpx;
    border-radius: $border-radius-full;
    font-size: $font-size-base;
    font-weight: 600;
  }

  .back-btn {
    background: $text-primary;
    color: #fff;
  }

  .retry-btn {
    background: $accent-color;
    color: #fff;
  }
}

// 确认信息
.confirm-section {
  background: #fff;
  border-radius: $border-radius-xl;
  padding: $spacing-xl;
  box-shadow: $shadow-sm;

  .confirm-title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-lg;
  }

  .info-card {
    background: #f9fafb;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-xl;

    .info-row {
      @include flex(row, space-between, center);
      padding: $spacing-md 0;
      border-bottom: 1rpx solid $border-light;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: $font-size-base;
        color: $text-secondary;
      }

      .value {
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-primary;
      }
    }
  }

  .action-buttons {
    @include flex(row, space-between, center);
    gap: $spacing-md;

    button {
      flex: 1;
      height: 88rpx;
      border-radius: $border-radius-full;
      font-size: $font-size-base;
      font-weight: 600;
    }

    .modify-btn {
      background: #f1f5f9;
      color: $text-primary;
    }

    .confirm-btn {
      background: $primary-color;
      color: #fff;

      &[disabled] {
        opacity: 0.6;
      }
    }
  }
}

// 修改信息弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  @include flex(row, center, center);
  animation: fadeIn 0.2s;
}

.modal-container {
  width: 640rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: $border-radius-xl;
  overflow: hidden;
  animation: slideUp 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(40rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: $spacing-lg;
  border-bottom: 1rpx solid $border-light;
  @include flex(row, center, center);
  position: relative;

  .modal-title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-primary;
  }

  .modal-close {
    position: absolute;
    right: $spacing-lg;
    padding: 8rpx;
  }
}

.modal-body {
  padding: $spacing-lg;
  max-height: 60vh;
  overflow-y: auto;

  .input-item {
    margin-bottom: $spacing-lg;

    .label {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-secondary;
      margin-bottom: $spacing-sm;
      display: block;

      &.required::before {
        content: "*";
        color: $accent-color;
        margin-right: 4rpx;
      }
    }

    .custom-input {
      width: 100%;
      background: #f9fafb;
      border: 1rpx solid $border-light;
      border-radius: $border-radius-lg;
      padding: 20rpx;
      font-size: $font-size-base;
      box-sizing: border-box;
    }

    .picker-input {
      @include flex(row, space-between, center);
      background: #f9fafb;
      border: 1rpx solid $border-light;
      border-radius: $border-radius-lg;
      padding: 20rpx;
      font-size: $font-size-base;
    }
  }
}

.modal-footer {
  padding: $spacing-lg;
  border-top: 1rpx solid $border-light;
  @include flex(row, space-between, center);
  gap: $spacing-md;

  button {
    flex: 1;
    height: 88rpx;
    border-radius: $border-radius-full;
    font-size: $font-size-base;
    font-weight: 600;
  }

  .modal-cancel-btn {
    background: #f1f5f9;
    color: $text-primary;
  }

  .modal-confirm-btn {
    background: $primary-color;
    color: #fff;

    &[disabled] {
      opacity: 0.6;
    }
  }
}

.btn-hover {
  opacity: 0.8;
  transform: scale(0.98);
}

.ph-style {
  color: $text-tertiary;
}
</style>
