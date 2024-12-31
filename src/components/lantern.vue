<template>
  <div class="lantern-container">
    <div class="lantern-group right-group">
      <div class="deng-box">
        <div class="deng">
          <div class="xian" />
          <div class="deng-a">
            <div class="deng-b">
              <div class="deng-t">快</div>
            </div>
          </div>
          <div class="shui shui-a">
            <div class="shui-c" />
            <div class="shui-b" />
          </div>
        </div>
      </div>
      <div class="deng-box deng-box--2">
        <div class="deng">
          <div class="xian" />
          <div class="deng-a">
            <div class="deng-b">
              <div class="deng-t">乐</div>
            </div>
          </div>
          <div class="shui shui-a">
            <div class="shui-c" />
            <div class="shui-b" />
          </div>
        </div>
      </div>
    </div>
    <div class="lantern-group left-group">
      <div class="deng-box">
        <div class="deng">
          <div class="xian" />
          <div class="deng-a">
            <div class="deng-b">
              <div class="deng-t">新</div>
            </div>
          </div>
          <div class="shui shui-a">
            <div class="shui-c" />
            <div class="shui-b" />
          </div>
        </div>
      </div>
      <div class="deng-box deng-box--2">
        <div class="deng">
          <div class="xian" />
          <div class="deng-a">
            <div class="deng-b">
              <div class="deng-t">年</div>
            </div>
          </div>
          <div class="shui shui-a">
            <div class="shui-c" />
            <div class="shui-b" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 灯笼组件
// 由AI生成
</script>

<style lang="scss" scoped>
.lantern-container {
  position: fixed;
  top: calc(var(--layout-header-height) + 5px);
  width: 100%;
  z-index: 50;
  pointer-events: none;
}

.lantern-group {
  position: fixed;
  top: 70px;
  animation: swing 3s infinite ease-in-out;
  transform-origin: 50% -10px;

  &.left-group {
    left: 40px;
    animation-delay: -1.5s;

    .deng-box:nth-child(2) {
      margin-top: -12px;

      .deng {
        animation: swing-extra 2s infinite ease-in-out;
        animation-delay: -0.5s;
      }
    }
  }

  &.right-group {
    right: 30px;
    animation-delay: -0.5s;

    .deng-box:nth-child(2) {

      .deng {
        animation: swing-extra 2s infinite ease-in-out;
        animation-delay: -1s;
      }
    }
  }

  .deng {
    animation: none;
  }

  .deng-box {
    position: relative;
    top: -40px;

    &:first-child {
      z-index: 2;
      .deng {
        margin-bottom: 23px;
      }
    }

    &:nth-child(2) {
      z-index: 1;
    }
  }
}

.deng {
  position: relative;
  width: 120px;
  height: 90px;
  margin: 50px;
  background: rgba(216, 0, 15, 0.8);
  border-radius: 50% 50%;
  transform-origin: 50% -100px;
  animation: swing 3s infinite ease-in-out;
  box-shadow: -5px 5px 50px 4px rgba(250, 108, 0, 1);
}

.deng-a {
  width: 100px;
  height: 90px;
  background: rgba(216, 0, 15, 0.1);
  margin: 12px 8px 8px 10px;
  border-radius: 50% 50%;
  border: 2px solid #dc8f03;
}

.deng-b {
  width: 45px;
  height: 90px;
  background: rgba(216, 0, 15, 0.1);
  margin: -4px 8px 8px 26px;
  border-radius: 50% 50%;
  border: 2px solid #dc8f03;
}

.xian {
  position: absolute;
  top: -20px;
  left: 60px;
  width: 2px;
  height: 20px;
  background: #dc8f03;
}

.shui-a {
  position: relative;
  width: 5px;
  height: 20px;
  margin: -5px 0 0 59px;
  transform-origin: 50% -45px;
  background: #ffa500;
  border-radius: 0 0 5px 5px;
}

.shui-b {
  position: absolute;
  top: 14px;
  left: -2px;
  width: 10px;
  height: 10px;
  background: #dc8f03;
  border-radius: 50%;
}

.shui-c {
  position: absolute;
  top: 18px;
  left: -2px;
  width: 10px;
  height: 35px;
  background: #ffa500;
  border-radius: 0 0 0 5px;
}

.deng:before {
  position: absolute;
  top: -7px;
  left: 29px;
  height: 12px;
  width: 60px;
  content: " ";
  display: block;
  z-index: 999;
  border-radius: 5px 5px 0 0;
  border: solid 1px #dc8f03;
  background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
}

.deng:after {
  position: absolute;
  bottom: -7px;
  left: 10px;
  height: 12px;
  width: 60px;
  content: " ";
  display: block;
  margin-left: 20px;
  border-radius: 0 0 5px 5px;
  border: solid 1px #dc8f03;
  background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
}

.deng-t {
  font-family: 华文行楷, Arial, Lucida Grande, Tahoma, sans-serif;
  font-size: 3.2rem;
  color: #ffd000;
  line-height: 85px;
  text-align: center;
  margin-left: -5px;
}

@keyframes swing {
  0% { transform: rotate(-6deg) }
  50% { transform: rotate(6deg) }
  100% { transform: rotate(-6deg) }
}

@keyframes swing-extra {
  0% { transform: rotate(-3deg) }
  50% { transform: rotate(3deg) }
  100% { transform: rotate(-3deg) }
}

@media screen and (max-width: 1024px) {
  .lantern-container {
    display: none;
  }
}
</style>
