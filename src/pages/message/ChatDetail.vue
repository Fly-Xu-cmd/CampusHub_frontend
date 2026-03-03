<template>
  <CommonLayout headerType="standard" title="群聊详情" padding="0 0">
    <view class="content">
      <!-- 群聊信息区域 -->
      <view class="group-info">
        <view class="group-avatar">
          <image
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200&h=200&fit=crop&crop=face"
            mode="aspectFill"
          ></image>
        </view>
        <view class="group-name">{{ params.name }}</view>
        <view class="group-member-count">{{ params.member_count }}名成员</view>
      </view>
      <!-- 群成员列表 -->
      <view class="group-members">
        <view class="members-header">
          <view class="members-title">群成员</view>
          <view class="members-count">{{ params.member_count }}人</view>
        </view>
        <view class="members-list">
          <!-- 群成员 -->
          <view
            class="member-item"
            v-for="member in members"
            :key="member.user_id"
          >
            <view class="member-avatar">
              <image :src="member.avatar" mode="aspectFill"></image>
            </view>
            <view class="member-info">
              <view class="member-name">{{ member.username || "默认名" }}</view>
              <view v-if="member.role === 'owner'" class="member-role"
                >群主</view
              >
            </view>
            <view class="member-more" @click="goToProfile(member.user_id)"
              >⋯</view
            >
          </view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { getGroupMembers } from "@/api/message/router";
import { ref, onMounted } from "vue";
// 从URL参数获取群ID
import { useRoute } from "vue-router";
const route = useRoute();
const params = route.query;

onMounted(() => {
  // 获取群聊成员
  getGroupMembers(params.group_id as string).then((res) => {
    members.value = res.data.members;
  });
});
// 群成员数据
const members = ref();

const goToProfile = (id: number) => {
  uni.navigateTo({
    url: `/pages/home/publicProfile?id=${id}`,
  });
};
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.content {
  padding: $spacing-md;
  background-color: $background-color;
  min-height: calc(100vh - var(--header-height));

  /* 群聊信息区域 */
  .group-info {
    @include flex(column, center, center);
    margin-bottom: $spacing-xl;

    .group-avatar {
      margin-bottom: $spacing-md;

      image {
        width: 200rpx;
        height: 200rpx;
        border-radius: $border-radius-lg;
      }
    }

    .group-name {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    .group-member-count {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  /* 群公告 */
  .group-notice {
    background-color: $surface-color;
    border-radius: $border-radius-lg;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-sm;

    .notice-header {
      @include flex(row, space-between, center);
      margin-bottom: $spacing-sm;

      .notice-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .notice-more {
        font-size: $font-size-sm;
        color: $primary-color;
      }
    }

    .notice-content {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.4;
    }
  }

  /* 群成员列表 */
  .group-members {
    background-color: $surface-color;
    border-radius: $border-radius-lg;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-sm;

    .members-header {
      @include flex(row, space-between, center);
      margin-bottom: $spacing-md;

      .members-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .members-count {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }

    .members-list {
      margin-bottom: $spacing-md;

      .member-item {
        @include flex(row, space-between, center);
        padding: $spacing-sm 0;
        border-bottom: 1rpx solid $border-light;

        &:last-child {
          border-bottom: none;
        }

        .member-avatar {
          margin-right: $spacing-sm;

          image {
            width: 80rpx;
            height: 80rpx;
            border-radius: $border-radius-full;
          }
        }

        .member-info {
          flex: 1;

          .member-name {
            font-size: $font-size-base;
            color: $text-primary;
            margin-bottom: 4rpx;
          }

          .member-role {
            font-size: $font-size-xs;
            color: $primary-color;
            background-color: rgba(249, 115, 22, 0.1);
            padding: 2rpx 8rpx;
            border-radius: $border-radius-sm;
            display: inline-block;
          }
        }

        .member-more {
          font-size: $font-size-lg;
          color: $text-tertiary;
        }
      }
    }

    .add-member-btn {
      @include flex(row, center, center);
      border: 1rpx dashed $border-color;
      border-radius: $border-radius-md;
      padding: $spacing-sm;

      .add-icon {
        font-size: $font-size-lg;
        color: $primary-color;
        margin-right: $spacing-xs;
      }

      .add-text {
        font-size: $font-size-sm;
        color: $primary-color;
      }
    }
  }

  /* 群管理功能 */
  .group-settings {
    background-color: $surface-color;
    border-radius: $border-radius-lg;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-sm;

    .setting-item {
      @include flex(row, space-between, center);
      padding: $spacing-md;
      border-bottom: 1rpx solid $border-light;

      &:last-child {
        border-bottom: none;
      }

      .setting-icon {
        font-size: $font-size-base;
        margin-right: $spacing-sm;
      }

      .setting-text {
        flex: 1;
        font-size: $font-size-base;
        color: $text-primary;
      }

      .setting-arrow {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }
  }

  /* 退出群聊按钮 */
  .leave-group-btn {
    @include flex(row, center, center);
    background-color: $surface-color;
    border-radius: $border-radius-lg;
    padding: $spacing-md;
    box-shadow: $shadow-sm;
    margin-top: $spacing-xl;

    .leave-text {
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $accent-color;
    }
  }
}
</style>
