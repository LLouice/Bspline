import numpy as np


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
                node_vector[k + flag * k + j + 1] = (i + 1) / piecewise
            flag += 1
    else:
        print("error")
        # return None
    return node_vector


#-------------------- Bspline dots -----------------
def bspline(n, k, points, fns):
    if(fns == "uniform"):
        node_vector = U_uniform(n, k)  # n+k+2
    elif(fns == "quasi"):
        node_vector = U_quasi_uniform(n, k)
    elif(fns == "piecewise" and (n % k) == 0 and (k % 1) == 0 and k >= 1):
        node_vector = U_piecewise_Bezier(n, k)

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
    return P_u_x, P_u_y


def echo():
    return "from bspline echo"


def get_points(raw_points: list):
    # points = np.array([len(raw_points), 2])
    points = np.array([[raw_points[0]["x"], raw_points[0]["y"]]])
    for point in raw_points[1:]:
        points = np.vstack((points, np.array([point["x"], point["y"]])))

    return points
