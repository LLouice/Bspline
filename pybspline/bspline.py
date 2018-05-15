import numpy as np
from scipy import interpolate
import matplotlib.pyplot as plt


def Bspline(i, k, u, node_vector):
    ''' 计算k次规范B样条基函数'''

    if k == 0:  # 0次B样条
        if node_vector[i] <= u < node_vector[i + 1]:
            Nik_u = 1.0
        else:
            Nik_u = 0.0

    else:
        length1 = node_vector[i + k] - node_vector[i]
        length2 = node_vector[i + k + 1] - node_vector[i + 1]
        if length1 == 0.0:   # 规定 0/0 = 0
            length1 = 1.0
        if length2 == 0.0:
            length2 = 1.0

        Nik_u_1 = (u - node_vector[i]) / length1 * \
            Bspline(i, k - 1, u, node_vector)
        Nik_u_2 = (node_vector[i + k + 1] - u) / \
            length2 * Bspline(i + 1, k - 1, u, node_vector)
        Nik_u = Nik_u_1 + Nik_u_2

    return Nik_u


def U_uniform(n, k):
    t = np.linspace(0, 1, n + k + 2, endpoint=True)
    return t


def U_quasi_uniform(n, k):
    '''
        准均匀B样条的节点向量计算, n+1个控制节点,k次B样条
    '''
    t = np.linspace(0, 1, n - k + 2, endpoint=True)  # 内结点 均匀分布
    t = np.append(np.zeros(k), t)  # 左边 k个结点 置0
    t = np.append(t, np.ones(k))  # 右边 k个结点 置1
    return t


def U_piecewise_Bezier(n, k):
    # 分段Bezier曲线的节点向量计算，共n+1个控制顶点，k次B样条
    # 分段Bezier端节点重复度为k+1，内间节点重复度为k,且满足n/k为正整数

    # 0...k  k+1...n+1  n+2...n+k+1
    # if (n % k) == 0 and (k % 1) == 0 and k >= 1:
    node_vector = np.zeros(n + k + 2)
    node_vector[n + 1: n + k + 2] = 1  # 右端节点置1
    # print(n, k)
    # print(node_vector)

    piecewise = int(n / k)
    flag = 0
    print(piecewise)
    if piecewise > 1:
        for i in range(piecewise - 1):  # 共 piecewise-1组
            for j in range(k):  # k 重复度
                print(i, j, "=>", k + flag * k + j + 1)
                node_vector[k + flag * k + j + 1] = (i + 1) / piecewise
            flag += 1
    else:
        print("error")
        # return None
    return node_vector


def U_quasi_uniform_old(n, k):
    '''
        准均匀B样条的节点向量计算, n+1个控制节点,k次B样条
    '''

    node_vector = np.zeros(n + k + 2)
    # 内结点 n-k 个 段数 n-k+1
    piecewise = n - k + 1  # 曲线的段数
    if piecewise == 1:  # 只有一段曲线时, n = k   0...n  n+1...n+k+1
        for i in range(n + 1, n + k + 2):
            node_vector[i] = 1

    # 0...k k+1...n+1 n+2...n+k+1
    else:
        flag = 1
        while flag != piecewise:
            node_vector[k + flag] = node_vector[k - 1 + flag] + 1 / piecewise
            flag = flag + 1

        node_vector[n + 1:n + k + 2] = 1

    return node_vector


# points =np.array( [(3 , 1), (2.5, 4), (0, 1), (-2.5, 4),
#                 (-3, 0), (-2.5, -4), (0, -1), (2.5, -4), (3, -1),])

# points = np.array([(3, 4), (2.5, 7), (0, 1), (-2.5, 4),
#                 (-3, 0), (-2.5, -4), (0, 8), (2.5, -4), (3, -1), ])


# 均匀B样条
# ---------------------------uniform---------------


def bspline(n, k, points, fns):
    if(fns == "uniform"):
        node_vector = U_uniform(n, k)  # n+k+2
    elif(fns == "quasi"):
        node_vector = U_quasi_uniform(n, k)
    elif(fns == "piecewise" and (n % k) == 0 and (k % 1) == 0 and k >= 1):
        node_vector = U_piecewise_Bezier(n, k)
        print("piecewise node_vector", node_vector)

    else:
        return None
    # n = t-k-1 =>　n+1?
    Nik = np.zeros((n + 1, 1))
    P_u_x = list()
    P_u_y = list()

    U = np.linspace(k / (n + k + 1), (n + 1) / (n + k + 1), 500,
                    endpoint=True) if fns == "uniform" else np.linspace(0, 1, 200, endpoint=False)

    for u in U:
        for i in range(0, n + 1, 1):
            Nik[i, :] = Bspline(i, k, u, node_vector)

        p_u = np.dot(points.T, Nik)  # 曲线上点的坐标
        P_u_x.append(p_u[0, 0])  # 所有点的横坐标
        P_u_y.append(p_u[1, 0])  # 所有点的纵坐标

    # P_u_x = np.asarray(P_u_x)
    # P_u_y = np.asarray(P_u_y)
    # plt.plot(P_u_x, P_u_y, "g-", linewidth=2.0, label='B-spline uniform')
    return P_u_x, P_u_y


# 准均匀

# def bspline_quasi(n, k, points)
def bspline_quasi(n, k, points):
    x = points[:, 0]
    y = points[:, 1]
    t = U_quasi_uniform(n, k)
    tck_quasi = [t, [x, y], k]
    u3 = np.linspace(0, 1, (max((n + 1) * 2, 70)), endpoint=True)
    out_quasi = interpolate.splev(u3, tck_quasi)
    return out_quasi[0].tolist(), out_quasi[1].tolist()
    # plt.plot(out_quasi[0], out_quasi[1], color[k - 3],
    #          linewidth=2.0, label='B-spline quasi degree ' + str(k))


def echo():
    return "from bspline echo"


def get_points(raw_points: list):
    # points = np.array([len(raw_points), 2])
    points = np.array([[raw_points[0]["x"], raw_points[0]["y"]]])
    for point in raw_points[1:]:
        points = np.vstack((points, np.array([point["x"], point["y"]])))

    return points


def main():
    # points = np.array([[50.,  25.],
    #                    [59.,  12.],
    #                    [50.,  10.],
    #                    [57.,   2.],
    #                    [40.,   4.],
    #                    [40.,   14.],
    #                    [30, 18]])
    points = np.array([[9.036145, 21.084337, 37.607573, 51.893287, 61.187608],
                       [51.779661, 70.084746, 50.254237, 69.745763, 49.576271]])

    points = points.T

    print(points)

    color = ['r', 'y', 'w']

    x = points[:, 0]
    y = points[:, 1]

    # uncomment both lines for a closed curve
    # x=np.append(x,[x[0]])
    # y=np.append(y,[y[0]])

    l = len(x)
    n = l - 1
    k = 2
# 控制点及连线
    plt.plot(x, y, 'k--', label='Control polygon',
             marker='o', markerfacecolor='red')
    # plt.plot(x,y,'ro',label='Control points only')

    P_u_x, P_u_y = bspline(n, k, points, "uniform")
    P_u_x = np.asarray(P_u_x)
    P_u_y = np.asarray(P_u_y)

    plt.plot(P_u_x, P_u_y, "g-", linewidth=2.0, label='B-spline uniform')
    out_quasi_x, out_quasi_y = bspline_quasi(n, k, points)
    out_quasi_x = np.asarray(out_quasi_x)
    out_quasi_y = np.asarray(out_quasi_y)
    plt.plot(out_quasi_x, out_quasi_y, color[0],
             linewidth=2.0, label='B-spline quasi degree ' + str(k))
    out_quasi_x, out_quasi_y = bspline_quasi(n, k + 1, points)
    out_quasi_x = np.asarray(out_quasi_x)
    out_quasi_y = np.asarray(out_quasi_y)
    plt.plot(out_quasi_x, out_quasi_y, color[1],
             linewidth=2.0, label='B-spline quasi degree ' + str(k + 1))

    P_u_x, P_u_y = bspline(n, k, points, "piecewise")
    P_u_x = np.asarray(P_u_x)
    P_u_y = np.asarray(P_u_y)
    plt.plot(P_u_x, P_u_y, "b-", linewidth=2.0, label='B-spline piecewise')

    plt.legend(loc='best')
    plt.axis([min(x) - 1, max(x) + 1, min(y) - 1, max(y) + 1])
    plt.title(' B-spline curve evaluation')
    # plt.show()
    plt.pause(150)
    plt.close()

if __name__ == '__main__':
    raw_points = [{"x": 1, "y": 2}, {"x": 3, "y": 4}]
    print(type(get_points(raw_points)))
    print(get_points(raw_points))
    main()
